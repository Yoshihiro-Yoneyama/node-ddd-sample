import {main} from './index';
import {expect, it} from "@jest/globals";

it.each([
	[
		'BTDD500',
		 550,
	],
	[
		'DTDD500',
		 540,
	],
	[
		'DTDD400:BTDD199',
		 647,
	],
	[
		'BTDD200:DTDD400:BTDD200',
		 868,
	],
	[
		'BTDD200:DTDD400:BTDD199',
		867,
	],
	[
		'DTDD200:BTDD300',
		 486,
	],
	[
		'DTDD2:BTDD5',
		 8,
	],
	[
		'DTDD10000:BTDD10000',
		 22000,
	],
	[
		'DTDD3:DTDD3:DTDD3',
		 9,
	],
])('注文データが%sの場合、税込合計金額は%s円になる。', (input, actual) => {
	expect(main(input)).toBe(actual);
});
