// FROM https://github.com/bramstein/url-template
// https://github.com/bramstein/url-template/commit/dc6064265ad8aec8655345610220e92cdfa52584


var uriTemplate = function (template) {
    var operators = ['+', '#', '.', '/', ';', '?', '&'];

    function encodeReserved(str) {
        return str.split(/(%[0-9A-Fa-f]{2})/g).map(function (part) {
            if (!/%[0-9A-Fa-f]/.test(part)) {
                part = encodeURI(part);
            }
            return part;
        }).join('');
    }

    function encodeValue(operator, value, key) {
        value = (operator === '+' || operator === '#') ? encodeReserved(value) : encodeURIComponent(value);

        if (key) {
            return encodeURIComponent(key) + '=' + value;
        } else {
            return value;
        }
    }

    function isDefined(value) {
        return value !== undefined && value !== null;
    }

    function isKeyOperator(operator) {
        return operator === ';' || operator === '&' || operator === '?';
    }

    function getValues(context, operator, key, modifier) {
        var value = context[key],
            result = [];

        if (isDefined(value) && value !== '') {
            if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
                value = value.toString();

                if (modifier && modifier !== '*') {
                    value = value.substring(0, parseInt(modifier, 10));
                }

                result.push(encodeValue(operator, value, isKeyOperator(operator) ? key : null));
            } else {
                if (modifier === '*') {
                    if (Array.isArray(value)) {
                        value.filter(isDefined).forEach(function (value) {
                            result.push(encodeValue(operator, value, isKeyOperator(operator) ? key : null));
                        });
                    } else {
                        Object.keys(value).forEach(function (k) {
                            if (isDefined(value[k])) {
                                result.push(encodeValue(operator, value[k], k));
                            }
                        });
                    }
                } else {
                    var tmp = [];

                    if (Array.isArray(value)) {
                        value.filter(isDefined).forEach(function (value) {
                            tmp.push(encodeValue(operator, value));
                        });
                    } else {
                        Object.keys(value).forEach(function (k) {
                            if (isDefined(value[k])) {
                                tmp.push(encodeURIComponent(k));
                                tmp.push(encodeValue(operator, value[k].toString()));
                            }
                        });
                    }

                    if (isKeyOperator(operator)) {
                        result.push(encodeURIComponent(key) + '=' + tmp.join(','));
                    } else if (tmp.length !== 0) {
                        result.push(tmp.join(','));
                    }
                }
            }
        } else {
            if (operator === ';') {
                result.push(encodeURIComponent(key));
            } else if (operator === '&' || operator === '?') {
                result.push(encodeURIComponent(key) + '=');
            } else if (value === '') {
                result.push('');
            }
        }
        return result;
    }

    return function (context) {
        return template.replace(/\{([^\{\}]+)\}|([^\{\}]+)/g, function (_, expression, literal) {
            if (expression) {
                var operator = null,
                    values = [];

                if (operators.indexOf(expression.charAt(0)) !== -1) {
                    operator = expression.charAt(0);
                    expression = expression.substr(1);
                }

                expression.split(/,/g).forEach(function (variable) {
                    var tmp = /([^:\*]*)(?::(\d+)|(\*))?/.exec(variable);
                    values.push.apply(values, getValues(context, operator, tmp[1], tmp[2] || tmp[3]));
                });

                if (operator && operator !== '+') {
                    var separator = ',';

                    if (operator === '?') {
                        separator = '&';
                    } else if (operator !== '#') {
                        separator = operator;
                    }
                    return (values.length !== 0 ? operator : '') + values.join(separator);
                } else {
                    return values.join(',');
                }
            } else {
                return encodeReserved(literal);
            }
        });
    };
};
