'use strict';

const postcss = require('postcss');

const processPrimitiveAtRule = (buildRules, atRule) => {
    let atRuleParams = postcss.list.comma(atRule.params);

    let prop = atRuleParams[0];

    if (!prop) {
        throw atRule.error(`@${atRule.name} must specify property`);
    }

    let shortcut = prop;

    if (atRuleParams.length > 1) {
        shortcut = atRuleParams[1];
    }

    let valueMap = new Map();

    atRule.walkDecls((decl) => {
        valueMap.set(decl.prop, decl.value);
    });

    let outRules = buildRules.call(atRule, prop, shortcut, valueMap);

    atRule.replaceWith(...outRules);
};

const processPrimitiveAtRules = (buildRules, container) => {
    container.walkAtRules('primitive', (atRule) => {
        processPrimitiveAtRule(buildRules, atRule);
    });
};

const classNameSelector = (className) => {
    let parser = require('postcss-selector-parser');
    let out = parser.className();
    out.value = className;
    return out.toString();
};

class BuildSelector {
    constructor(prefix, sep) {
        this.prefix = prefix;
        this.sep = sep;
    }

    call(shortcut, valueName) {
        return classNameSelector(
            `${this.prefix}${shortcut}${this.sep}${valueName}`
        );
    }
}

class BuildRule {
    constructor(buildSelector) {
        this.buildSelector = buildSelector;
    }

    call(atRule, prop, shortcut, value, valueName) {
        let outRule = postcss.rule({
            selector: this.buildSelector.call(shortcut, valueName),
        });

        outRule.source = atRule.source;

        let outDecl = postcss.decl({ prop, value });

        outDecl.source = atRule.source;

        outRule.append(outDecl);

        return outRule;
    }
}

class BuildRules {
    constructor(buildRule) {
        this.buildRule = buildRule;
    }

    call(atRule, prop, shortcut, valueMap) {
        let outRules = [];

        valueMap.forEach((value, valueName) => {
            let outRule = this.buildRule.call(
                atRule,
                prop,
                shortcut,
                value,
                valueName
            );

            outRules.push(outRule);
        });

        return outRules;
    }
}

module.exports = postcss.plugin(
    'postcss-plugin-custom-primitives',
    (opts = {}) => {
        const defaultOpts = {
            prefix: 'has-',
            sep: ':',
            buildSelectorClass: BuildSelector,
            buildRuleClass: BuildRule,
            buildRulesClass: BuildRules,
        };

        opts = { ...defaultOpts, ...opts };

        let buildSelector = new opts.buildSelectorClass(opts.prefix, opts.sep);

        let buildRule = new opts.buildRuleClass(buildSelector);

        let buildRules = new opts.buildRulesClass(buildRule);

        return (root, result) => {
            processPrimitiveAtRules(buildRules, root);
        };
    }
);

module.exports.BuildSelector = BuildSelector;

module.exports.BuildRule = BuildRule;

module.exports.BuildRules = BuildRules;
