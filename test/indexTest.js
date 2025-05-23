const chai = require('chai');
global.expect = chai.expect;

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const babel = require('@babel/core');

// Load HTML
const html = fs.readFileSync(path.resolve(__dirname, '..', 'index.html'), 'utf-8');

// Transform JS for JSDOM
const { code: transformedScript } = babel.transformFileSync(
  path.resolve(__dirname, '..', 'index.js'),
  { presets: ['@babel/preset-env'] }
);

// Create JSDOM
const dom = new JSDOM(html, {
  runScripts: "dangerously",
  resources: "usable"
});

// Load fetch polyfill
const fetchPkg = 'node_modules/whatwg-fetch/dist/fetch.umd.js';
dom.window.eval(fs.readFileSync(fetchPkg, 'utf-8'));

// Inject script
const script = dom.window.document.createElement("script");
script.textContent = transformedScript;
dom.window.document.body.appendChild(script);

// Expose globals for testing
global.window = dom.window;
global.document = dom.window.document;
global.navigator = dom.window.navigator;
global.HTMLElement = dom.window.HTMLElement;
global.Node = dom.window.Node;
global.Text = dom.window.Text;
global.XMLHttpRequest = dom.window.XMLHttpRequest;

// Tests
describe('Asynchronous Fetching ', () => {
  it('should fetch to external api and add information to page', async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    let postDisplay = document.querySelector("#post-list");
    expect(postDisplay.innerHTML).to.include('sunt aut');
  });

  it('should create an h1 and p element to add', async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    let h1 = document.querySelector("h1");
    let p = document.querySelector("p");
    expect(h1.textContent).to.include("sunt aut facere repellat");
    expect(p.textContent).to.include("quia et suscipit\nsuscipit");
  });
});
