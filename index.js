const postcss = require('postcss');

const selectorParser = require('postcss-selector-parser');

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

    let outRules = buildRules(atRule, prop, shortcut, valueMap);

    atRule.replaceWith(...outRules);
};

const processPrimitiveAtRules = (buildRules, container) => {
    container.walkAtRules('primitive', (atRule) => {
        processPrimitiveAtRule(buildRules, atRule);
    });
};

const mkBuildSelector = (prefix, sep) => {
    return (shortcut, valueName) => {
        let outSelector = selectorParser.className();
        outSelector.value = `${prefix}${shortcut}${sep}${valueName}`;
        return outSelector.toString();
    };
};

const mkBuildRule = (buildSelector) => {
    return (atRule, prop, shortcut, value, valueName) => {
        let outRule = postcss.rule({
            selector: buildSelector(shortcut, valueName),
        });

        outRule.source = atRule.source;

        let outDecl = postcss.decl({ prop, value });

        outDecl.source = atRule.source;

        outRule.append(outDecl);

        return outRule;
    };
};

const mkBuildRules = (buildRule) => {
    return (atRule, prop, shortcut, valueMap) => {
        let outRules = [];

        valueMap.forEach((value, valueName) => {
            let outRule = buildRule(atRule, prop, shortcut, value, valueName);

            outRules.push(outRule);
        });

        return outRules;
    };
};

module.exports = postcss.plugin(
    'postcss-plugin-custom-primitives',
    (opts = {}) => {
        let prefix = opts.prefix === undefined ? 'has-' : opts.prefix;

        let sep = opts.sep === undefined ? ':' : opts.sep;

        let buildSelector;

        if (opts.buildSelector) {
            buildSelector = opts.buildSelector;
        } else {
            buildSelector = mkBuildSelector(prefix, sep);
        }

        let buildRule;

        if (opts.buildRule) {
            buildRule = opts.buildRule;
        } else {
            buildRule = mkBuildRule(buildSelector);
        }

        let buildRules;

        if (opts.buildRules) {
            buildRules = opts.buildRules;
        } else {
            buildRules = mkBuildRules(buildRule);
        }

        return (root, result) => {
            processPrimitiveAtRules(buildRules, root);
        };
    }
);

module.exports.mkBuildSelector = mkBuildSelector;

module.exports.mkBuildRule = mkBuildRule;

module.exports.mkBuildRules = mkBuildRules;
