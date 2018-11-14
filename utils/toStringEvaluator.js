const parseStatement = str => new Statement(str);
export default {parseStatement};

function Statement (str) {
    const ifRegExp = new RegExp('^[ ]*if[ ]+\\(', 'i');
    const thenHideRegExp = new RegExp('\\)[ ]*then[ ]+hide[ ]*\\(', 'i');
    const parseRegExp = new RegExp('^[ ]*if[ ]+\\((.*)\\)[ ]*then[ ]+hide[ ]*\\((.*)\\)$', 'i');
    const parseFields = new RegExp('"(.*?)"', 'ig');

    this.evaluate = function (entityInstance) {
		var value = true;
		for (var i = 0; i < this._conditions.length; i++) {
            if (i === 0) {
                var attrName = this._conditions[i].getAttrName();
                value = String(entityInstance[attrName]) === this._conditions[i].getValue();
            } else {
                var operator = this._conditions[i];
                i++;
                var attrName = this._conditions[i].getAttrName();
                if (operator === 'or') value = value || String(entityInstance[attrName]) === this._conditions[i].getValue();
                else value = value && String(entityInstance[attrName]) === this._conditions[i].getValue();
            }
        }

		if (value) return this.getFields();
		else return [];
	}

	this.getFields = function () {
		return this._fields;
	}

	this.getConditions = function () {
		return this._conditions;
	}

	this._parse = function (str) {
		this._index = 0;
		this._str = str || '';

        if (!ifRegExp.test(str)) throw new Error('Expected "IF"');
        if (!thenHideRegExp.test(str)) throw new Error('Expected "THEN HIDE"');
        const parseArr = parseRegExp.exec(str);
        const condition = parseArr[1];
        const fields = parseArr[2];

        if (!condition) throw new Error('Condition is not defined');
        if (!fields) throw new Error('Field list to hide is not defined');

		this._conditions = this._parseCondition(condition);
		this._fields = this._parseFields(fields);
	}

	this._parseCondition = function (str) {
		var result = [], condition;

		this._index = 0;
		this._str = str;

		this._readUntil('"');

		while (condition = this._parseOneCondition()) {
			result.push(condition);

			var oper = this._readUntil('"');

			if (oper) result.push(oper.trim().toLowerCase());
			else break;
		}

        return result;
    };

	this._parseOneCondition = function () {
		var attrName = this._readUntil('"');

		if (!attrName) return null;

		this._readUntil('"');

		var value = this._readUntil('"');

		return new Condition(attrName, value);
	};

    this._parseFields = function (str) {
        const result = [];
        // var fields = str.split(',');
        const fields = str.match(parseFields);
        //
        for (var i = 0; i < fields.length; i++) {
        var field = fields[i].trim();

        if (field.substr(0, 1) !== '"') throw 'Field ' + field + ' should start with "';
        if (field.substr(field.length - 1, 1) !== '"') throw 'Field ' + field + ' should end with "';

        result.push(field.substr(1, field.length - 2));
        }

        return result;
    };

	this._readUntil = function (str) {
		var index = this._str.indexOf(str, this._index);

		if (index == -1) index = this._str.length;

		var result = this._str.substr(this._index, index - this._index);

		this._index = index + 1;

		return result;
	}

	this._parse(str);
}

function Condition (attr, val) {
	this._attr = attr;
	this._val = val;

	this.getAttrName = function () {
		return this._attr;
	}

	this.getValue = function () {
		return this._val;
	}
}
