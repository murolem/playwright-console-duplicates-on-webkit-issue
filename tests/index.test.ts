import { test, expect, ConsoleMessage } from '@playwright/test';
import { sayHello } from '../src/index.ts';

test('prints a "hello world" console message', async ({ page }) => {
    // expose a function `debugLog` which does nothing by itself
    // but if there is `debugLogHandler` function defined, it will be called with given message `str` 
    // in this example, `debugLogHandler` is never defined
    await page.exposeFunction('debugLog', (str: string) => {
        if (debugLogHandler) {
            debugLogHandler(str);
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

    expect(consoleMessages.length).toBe(1);
    expect(consoleMessages[0]).toBe('hello world!');
});

async function wait(ms: number): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, ms));
}