# must-be

The module provides a set of assertion functions for verifying variables

## Features

* Error call stack shifting
* Variable names are parsed from your code

## Usage

```
	npm i hkey-must-be
```

```js
	const mustBe  = require('hkey-must-be');
	const someVal = 0;
	
	mustBe.number(someVal);
	mustBe.finite.number(someVal); //or mustBe.finite_number  or .finiteNumber or number.finite 
	mustBe.notNegative.finite.number(someVal);
	mustBe.notNegative.finite.int(someVal);

	mustBe.positive.finite.integer(someVal); 
	//Error: "someVal mustBe.positive.finite.integer! Given 0 (Number)"
```

```js
	mustBe.plainObject({});
	mustBe.normalObject({}); //not Array Promise Error, etc

	mustBe.notEmpty.normalObject({}, 'someValName'); // will be Error
```


```js
	mustBe.array([]);
	mustBe.notEmpty.array([], 'someValName'); // will be Error
```

```js
	if(mustBe.is.normalObject({})){
		...
	}
	if(mustBe.is.notEmpty.normalObject({foo: 'bar'})){
		...
	}
```