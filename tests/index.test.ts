import { test, expect, ConsoleMessage } from '@playwright/test';
import { sayHello } from '../src/index.ts';

test('prints a "hello world" console message', async ({ page }) => {
    // expose a function `debugLog` which does nothing by itself
    // check if some other function exists
    await page.exposeFunction('debugLog', (str: string) => {
        // @ts-ignore
        if(window['somePropertyThatDoesNotExists']) {
            // do something here...
        }
    });

    // define array of future console message and a listener which will be adding them here
    const consoleMessages: string[] = [];
    const consoleEventListener = (consoleMsg: ConsoleMessage) => {
        consoleMessages.push(consoleMsg.text());
    }
    page.addListener('console', consoleEventListener);

    // run `sayHello()`
    await page.evaluate((scriptStr) => {
        eval(scriptStr);

        sayHello();
    }, sayHello.toString());

    // waiting 1000ms for all messages to be printed
    await wait(1000);

    page.removeListener('console', consoleEventListener);
    
    // log collected messages
    console.log('console messages:', JSON.stringify(consoleMessages, null, 2));

    expect(consoleMessages.length).toBe(2);
    expect(consoleMessages[0]).toBe('hello world!');
    expect(consoleMessages[1]).toBe('hello world, again!');
});

async function wait(ms: number): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, ms));
}