'use strict';

/* eslint-disable no-await-in-loop */

const uuid = require('uuid');

const AttackObject = require('../models/attack-object-model');
const Matrix = require('../models/matrix-model');
const Mitigation = require('../models/mitigation-model');
const Note = require('../models/note-model');
const Relationship = require('../models/relationship-model');
const Software = require('../models/software-model');
const Tactic = require('../models/tactic-model');
const Technique = require('../models/technique-model');

const systemConfigurationService = require('./system-configuration-service');
const linkById = require('../lib/linkById');

const errors = {
    notFound: 'Domain not found',
};
exports.errors = errors;

// Retrieve the attack object from the database using its STIX ID
async function getAttackObject(stixId) {
    const attackObject = await AttackObject
        .findOne({ 'stix.id': stixId })
        .sort('-stix.modified')
        .lean()
        .exec();

    return attackObject;
}

const attackIdObjectTypes = ['intrusion-set', 'malware', 'tool', 'attack-pattern', 'course-of-action', 'x-mitre-data_source'];
function requiresAttackId(attackObject) {
    return attackIdObjectTypes.includes(attackObject?.stix.type);
}

const sourceNames = ['mitre-attack', 'mitre-mobile-attack', 'mobile-attack', 'mitre-ics-attack'];
function hasAttackId(attackObject) {
    const externalReferences = attackObject?.stix.external_references;
    if (Array.isArray(externalReferences) && externalReferences.length > 0) {
        const mitreAttackReference = externalReferences.find(ref => sourceNames.includes(ref.source_name));
        if (mitreAttackReference?.external_id) {
            return true;
        }
    }

    return false;
}

exports.exportBundle = async function(options) {
    // The attackObjectMap maps attack IDs to  attack objects and is used to make the LinkById conversion
    // more efficient.
    const attackObjectMap = new Map();
    function addAttackObjectToMap(attackObject) {
        if (attackObject?.workspace.attack_id) {
            attackObjectMap.set(attackObject.workspace.attack_id, attackObject);
        }
    }

    // Create the bundle to hold the exported objects
    const bundle = {
        type: 'bundle',
        id: `bundle--${uuid.v4()}`,
        objects: []
    };

    // Get the primary objects (objects that match the domain)

    // Build the query
    const primaryObjectsQuery = { 'stix.x_mitre_domains': options.domain };
    const matrixQuery = {  };
    if (!options.includeRevoked) {
        primaryObjectsQuery['stix.revoked'] = { $in: [null, false] };
        matrixQuery['stix.revoked'] = { $in: [null, false] };
    }
    if (!options.includeDeprecated) {
        primaryObjectsQuery['stix.x_mitre_deprecated'] = { $in: [null, false] };
        matrixQuery['stix.x_mitre_deprecated'] = { $in: [null, false] };
    }
    if (typeof options.state !== 'undefined') {
        if (Array.isArray(options.state)) {
            primaryObjectsQuery['workspace.workflow.state'] = { $in: options.state };
            matrixQuery['workspace.workflow.state'] = { $in: options.state };
        }
        else {
            primaryObjectsQuery['workspace.workflow.state'] = options.state;
            matrixQuery['workspace.workflow.state'] = options.state;
        }
    }

    // Build the aggregation
    // - Group the documents by stix.id, sorted by stix.modified
    // - Use the last document in each group (according to the value of stix.modified)
    // - Then apply query, skip and limit options
    const aggregation = [
        { $sort: { 'stix.id': 1, 'stix.modified': 1 } },
        { $group: { _id: '$stix.id', document: { $last: '$$ROOT' }}},
        { $replaceRoot: { newRoot: '$document' }},
        { $sort: { 'stix.id': 1 }},
        { $match: primaryObjectsQuery }
    ];

    // Retrieve the primary objects
    const domainMitigations = await Mitigation.aggregate(aggregation);
    const domainSoftware = await Software.aggregate(aggregation);
    const domainTactics = await Tactic.aggregate(aggregation);
    const domainTechniques = await Technique.aggregate(aggregation);

    // Retrieve the matrices
    const matrixAggregation = aggregation.filter(val => !val.$match);
    matrixAggregation.push({ $match: matrixQuery });
    const allMatrices = await Matrix.aggregate(matrixAggregation);
    const domainMatrices = allMatrices.filter(matrix => matrix?.stix?.external_references.length && matrix.stix.external_references[0].external_id === options.domain);

    let primaryObjects = [...domainMatrices, ...domainMitigations, ...domainSoftware, ...domainTactics, ...domainTechniques];

    // No primary objects means that the domain doesn't exist
    // Return an empty bundle
    if (primaryObjects.length === 0) {
        return bundle;
    }

    // Remove any primary objects that don't have an ATT&CK ID
    if (!options.includeMissingAttackId) {
        primaryObjects = primaryObjects.filter(o => hasAttackId(o));
    }

    // Put the primary objects in the bundle
    for (const primaryObject of primaryObjects) {
        bundle.objects.push(primaryObject.stix);
        addAttackObjectToMap(primaryObject);
    }

    // Get the relationships that point at primary objects (removing duplicates)

    // Create a map of the primary objects (only use the id, since relationships only reference the id)
    const objectsMap = new Map();
    for (const primaryObject of primaryObjects) {
        objectsMap.set(primaryObject.stix.id, true);
    }

    // Get all of the relationships
    // Use the aggregation to only get the last version of each relationship and
    // filter out revoked and deprecated relationships
    const relationshipQuery = { };
    if (!options.includeRevoked) {
        relationshipQuery['stix.revoked'] = { $in: [null, false] };
    }
    if (!options.includeDeprecated) {
        relationshipQuery['stix.x_mitre_deprecated'] = { $in: [null, false] };
    }
    if (typeof options.state !== 'undefined') {
        if (Array.isArray(options.state)) {
            relationshipQuery['workspace.workflow.state'] = { $in: options.state };
        }
        else {
            relationshipQuery['workspace.workflow.state'] = options.state;
        }
    }
    const relationshipAggregation = [
        { $sort: { 'stix.id': 1, 'stix.modified': 1 } },
        { $group: { _id: '$stix.id', document: { $last: '$$ROOT' }}},
        { $replaceRoot: { newRoot: '$document' }},
        { $match: relationshipQuery }
    ];
    const allRelationships = await Relationship.aggregate(relationshipAggregation);

    // Iterate over the relationships, keeping any that have a source_ref or target_ref that points at a primary object
    const relationships = [];
    for (const relationship of allRelationships) {
        if (objectsMap.has(relationship.stix.source_ref) || objectsMap.has(relationship.stix.target_ref)) {
            relationships.push(relationship);
        }
    }

    // Put the relationships in the bundle
    for (const relationship of relationships) {
        bundle.objects.push(relationship.stix);
    }

    function secondaryObjectIsValid(secondaryObject) {
        // The object must exist and at least one of these conditions must apply:
        //   1) The request allows objects that are missing an ATT&CK ID
        //   2) The objects is a type that doesn't require an ATT&CK ID
        //   3) The object has an ATT&CK ID
        return (secondaryObject && (options.includeMissingAttackId || !requiresAttackId(secondaryObject) || hasAttackId(secondaryObject)));
    }

    // Get the secondary objects (additional objects pointed to by a relationship)
    const secondaryObjects = [];
    const dataComponents = new Map();
    for (const relationship of relationships) {
        // Check source_ref
        if (!objectsMap.has(relationship.stix.source_ref)) {
            const secondaryObject = await getAttackObject(relationship.stix.source_ref);
            if (secondaryObjectIsValid(secondaryObject)) {
                secondaryObjects.push(secondaryObject);
                objectsMap.set(secondaryObject.stix.id, true);
            }

            // Save data components for later
            if (relationship.stix.relationship_type === 'detects') {
                dataComponents.set(secondaryObject.stix.id, secondaryObject.stix);
            }
        }

        // Check target_ref
        if (!objectsMap.has(relationship.stix.target_ref)) {
            const secondaryObject = await getAttackObject(relationship.stix.target_ref);
            if (secondaryObjectIsValid(secondaryObject)) {
                secondaryObjects.push(secondaryObject);
                objectsMap.set(secondaryObject.stix.id, true);
            }
        }
    }

    // Put the secondary objects in the bundle
    for (const secondaryObject of secondaryObjects) {
        // Groups need to have the domain added to x_mitre_domains
        if (secondaryObject.stix.type === 'intrusion-set') {
            secondaryObject.stix.x_mitre_domains = [ options.domain ];
        }
        bundle.objects.push(secondaryObject.stix);
        addAttackObjectToMap(secondaryObject);
    }

    // Data components have already been added to the bundle because they're referenced in a relationship
    // Get the data sources referenced by data components, using a map to eliminate duplicates
    const dataSourceIds = new Map();
    for (const bundleObject of bundle.objects) {
        if (bundleObject.type === 'x-mitre-data-component') {
            dataSourceIds.set(bundleObject.x_mitre_data_source_ref, true);
        }
    }

    // Retrieve the data sources, add to bundle, and save for deriving x_mitre_data_sources
    const dataSources = new Map();
    for (const dataSourceId of dataSourceIds.keys()) {
        const dataSource = await getAttackObject(dataSourceId);
        if (options.includeMissingAttackId || hasAttackId(dataSource)) {
            bundle.objects.push(dataSource.stix);
            dataSources.set(dataSourceId, dataSource.stix);
            addAttackObjectToMap(dataSource);
        }
    }

    // Create a map of techniques detected by data components
    const techniqueDetectedBy = new Map();
    for (const relationship of relationships) {
        if (relationship.stix.relationship_type === 'detects') {
            // technique (target_ref) detected by array of data-component (source_ref)
            const techniqueDataComponents = techniqueDetectedBy.get(relationship.stix.target_ref);
            if (techniqueDataComponents) {
                // Add to the existing array
                techniqueDataComponents.push(relationship.stix.source_ref);
            }
            else {
                // Create a new array and add to map
                techniqueDetectedBy.set(relationship.stix.target_ref, [relationship.stix.source_ref]);
            }
        }
    }

    // Supplement techniques with x_mitre_data_sources for backwards compatibility
    const icsDataSourceValues = await systemConfigurationService.retrieveAllowedValuesForTypePropertyDomain('technique', 'x_mitre_data_sources', 'ics-attack');
    for (const bundleObject of bundle.objects) {
        if (bundleObject.type === 'attack-pattern') {
            const enterpriseDomain = bundleObject.x_mitre_domains.find(domain => domain === 'enterprise-attack');
            const icsDomain = bundleObject.x_mitre_domains.find(domain => domain === 'attack-ics');
            if (enterpriseDomain && !icsDomain) {
                // Remove any existing data sources
                bundleObject.x_mitre_data_sources = [];

                // Add in any enterprise data sources from detects relationships
                const dataComponentIds = techniqueDetectedBy.get(bundleObject.id);
                if (dataComponentIds) {
                    for (const dataComponentId of dataComponentIds) {
                        const dataComponent = dataComponents.get(dataComponentId);
                        if (dataComponent) {
                            const dataSource = dataSources.get(dataComponent.x_mitre_data_source_ref);
                            if (dataSource) {
                                const derivedDataSource = `${ dataSource.name }: ${ dataComponent.name }`;
                                bundleObject.x_mitre_data_sources.push(derivedDataSource);
                            }
                            else {
                                console.log(`Referenced data source not found: ${ dataComponent.x_mitre_data_source_ref }`);
                            }
                        }
                        else {
                            console.log(`Referenced data component not found: ${ dataComponentId }`);
                        }
                    }
                }
            }
            else if (icsDomain && !enterpriseDomain) {
                // Remove any data sources that are not in the list of valid ICS data sources
                bundleObject.x_mitre_data_sources = bundleObject.x_mitre_data_sources.filter(source => icsDataSourceValues.allowedValues.find(value => value === source));
            }
            else if (enterpriseDomain && icsDomain) {
                // Remove any data sources that are not in the list of valid ICS data sources
                bundleObject.x_mitre_data_sources = bundleObject.x_mitre_data_sources.filter(source => icsDataSourceValues.allowedValues.find(value => value === source));

                // Add in any enterprise data sources from detects relationships
                const dataComponentIds = techniqueDetectedBy.get(bundleObject.id);
                if (dataComponentIds) {
                    for (const dataComponentId of dataComponentIds) {
                        const dataComponent = dataComponents.get(dataComponentId);
                        if (dataComponent) {
                            const dataSource = dataSources.get(dataComponent.x_mitre_data_source_ref);
                            if (dataSource) {
                                const derivedDataSource = `${dataSource.name}: ${dataComponent.name}`;
                                bundleObject.x_mitre_data_sources.push(derivedDataSource);
                            }
                            else {
                                console.log(`Referenced data source not found: ${ dataComponent.x_mitre_data_source_ref }`);
                            }
                        }
                        else {
                            console.log(`Referenced data component not found: ${ dataComponentId }`);
                        }
                    }
                }
            }
            else {
                // Remove any existing data sources
                bundleObject.x_mitre_data_sources = [];
            }
        }
    }

    // Create a map of relationship ids
    const relationshipsMap = new Map();
    for (const relationship of relationships) {
        relationshipsMap.set(relationship.stix.id, true);
    }

    // Get any note that references an object in the bundle
    // Start by getting all notes
    const allNotes = await Note.aggregate(relationshipAggregation);

    // Iterate over the notes, keeping any that have an object_ref that points at an object in the bundle
    const notes = [];
    for (const note of allNotes) {
        let includeNote = false;
        for (const objectRef of note.stix.object_refs) {
            if (objectsMap.has(objectRef) || relationshipsMap.has(objectRef)) {
                includeNote = true;
                break;
            }
        }
        if (includeNote) {
            notes.push(note);
        }
    }

    // Put the notes in the bundle
    for (const note of notes) {
        bundle.objects.push(note.stix);
    }

    // Create the function to be used by the LinkById conversion process
    // Note that using this map instead of database retrieval results in a
    // dramatic performance improvement.
    const getAttackObjectFromMap = async function (attackId) {
        let attackObject = attackObjectMap.get(attackId);
        if (!attackObject) {
            attackObject = await linkById.getAttackObjectFromDatabase(attackId);
        }
        return attackObject;
    }

    // Convert LinkById tags into markdown citations
    for (const attackObject of bundle.objects) {
        await linkById.convertLinkByIdTags(attackObject, getAttackObjectFromMap);
    }

    // Make a list of identities referenced
    const identitiesMap = new Map();
    for (const bundleObject of bundle.objects) {
        if (bundleObject.created_by_ref) {
            identitiesMap.set(bundleObject.created_by_ref, true);
        }
    }

    // Make a list of marking definitions referenced
    const markingDefinitionsMap = new Map();
    for (const bundleObject of bundle.objects) {
        if (bundleObject.object_marking_refs) {
            for (const markingRef of bundleObject.object_marking_refs) {
                markingDefinitionsMap.set(markingRef, true);
            }
        }
    }

    for (const stixId of identitiesMap.keys()) {
        const identity = await getAttackObject(stixId);
        if (identity) {
            bundle.objects.push(identity.stix);
        }
        else {
            console.log(`Referenced identity not found: ${ stixId }`);
        }
    }

    for (const stixId of markingDefinitionsMap.keys()) {
        const markingDefinition = await getAttackObject(stixId);
        bundle.objects.push(markingDefinition.stix);
    }

    // TBD: A marking definition can contain a created_by_ref
    // and an identity can contain a marking definition.
    // An unlikely edge case is for one of those to reference
    // an object that hasn't been loaded by any other object.

    return bundle;
}
