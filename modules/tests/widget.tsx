import React, { useEffect, useState, useRef } from 'react';
import { Collection } from '@beyond-js/firestore-collection/collection';

const collection = new Collection('Prompts');
(window as any).collection = collection;
console.log('Prompts collection is avaialble (window.collection)');

const Widget = () => {
	return <>Hello</>;
};

export default Widget;
