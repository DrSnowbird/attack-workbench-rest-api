'use strict';

const stixCore = require('./stix-core');

module.exports.attackPattern = {
    // STIX attack-pattern specific properties
    modified: { type: Date, required: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    kill_chain_phases: [ stixCore.killChainPhaseSchema ],

    // ATT&CK custom stix properties
    x_mitre_modified_by_ref: { type: String, trim: true },
    x_mitre_detection: { type: String, trim: true },
    x_mitre_platforms: [ { type: String, trim: true } ],
    x_mitre_is_subtechnique: Boolean,
    x_mitre_deprecated: Boolean,
    x_mitre_domains: [ { type: String, trim: true } ],
    x_mitre_version: { type: String, trim: true },
    x_mitre_attack_spec_version: { type: String, trim: true },
    x_mitre_contributors: [ { type: String, trim: true } ]
};

// Domain specific properties
module.exports.attackPatternEnterpriseDomain = {
    x_mitre_data_sources: { type: [ { type: String, trim: true } ], default: undefined },
    x_mitre_defense_bypassed: { type: [ { type: String, trim: true } ], default: undefined },
    x_mitre_impact_type: { type: [ { type: String, trim: true } ], default: undefined },
    x_mitre_permissions_required: { type: [ { type: String, trim: true } ], default: undefined },
    x_mitre_system_requirements: { type: [ { type: String, trim: true } ], default: undefined },
    x_mitre_effective_permissions: { type: [ { type: String, trim: true } ], default: undefined },
    x_mitre_remote_support: Boolean
};

module.exports.attackPatternMobileDomain = {
    x_mitre_tactic_type: { type: [ { type: String, trim: true } ], default: undefined }
};

module.exports.attackPatternICSDomain = {
    x_mitre_data_sources: { type: [ { type: String, trim: true } ], default: undefined }
};
