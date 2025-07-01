import {createDataToggle} from '../src';

describe('createDataToggle', () => {
    // Clean up DOM and console after each test
    afterEach(() => {
        document.body.innerHTML = '';
        document.documentElement.className = '';
        jest.clearAllMocks();
        jest.restoreAllMocks();
    });

    describe('Basic functionality', () => {
        test('should create toggle instance and bind events to data-toggle elements', () => {
            // Setup DOM
            document.body.innerHTML = `
        <button data-toggle="test-class">Toggle</button>
      `;

            const toggle = createDataToggle();
            const button = document.querySelector('[data-toggle]') as HTMLElement;

            // Simulate click
            button.click();

            // Check if class was toggled on html element
            expect(document.documentElement.classList.contains('test-class')).toBe(true);

            toggle.destroy();
        });

        test('should toggle class on and off with multiple clicks', () => {
            document.body.innerHTML = `
        <button data-toggle="active">Toggle</button>
      `;

            const toggle = createDataToggle();
            const button = document.querySelector('[data-toggle]') as HTMLElement;

            // First click - should add class
            button.click();
            expect(document.documentElement.classList.contains('active')).toBe(true);

            // Second click - should remove class
            button.click();
            expect(document.documentElement.classList.contains('active')).toBe(false);

            toggle.destroy();
        });

        test('should handle multiple toggle elements independently', () => {
            document.body.innerHTML = `
        <button data-toggle="class-a">Toggle A</button>
        <button data-toggle="class-b">Toggle B</button>
      `;

            const toggle = createDataToggle();
            const buttonA = document.querySelector('[data-toggle="class-a"]') as HTMLElement;
            const buttonB = document.querySelector('[data-toggle="class-b"]') as HTMLElement;

            buttonA.click();
            expect(document.documentElement.classList.contains('class-a')).toBe(true);
            expect(document.documentElement.classList.contains('class-b')).toBe(false);

            buttonB.click();
            expect(document.documentElement.classList.contains('class-a')).toBe(true);
            expect(document.documentElement.classList.contains('class-b')).toBe(true);

            toggle.destroy();
        });
    });

    describe('Custom target elements', () => {
        test('should toggle class on custom target using data-toggle-element', () => {
            document.body.innerHTML = `
        <div class="sidebar"></div>
        <button data-toggle="open" data-toggle-element=".sidebar">Toggle Sidebar</button>
      `;

            const toggle = createDataToggle();
            const button = document.querySelector('[data-toggle]') as HTMLElement;
            const sidebar = document.querySelector('.sidebar') as HTMLElement;

            button.click();

            expect(sidebar.classList.contains('open')).toBe(true);
            expect(document.documentElement.classList.contains('open')).toBe(false);

            toggle.destroy();
        });

        test('should use default target when data-toggle-element selector not found', () => {
            const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

            document.body.innerHTML = `
        <button data-toggle="test" data-toggle-element=".non-existent">Toggle</button>
      `;

            const toggle = createDataToggle();
            const button = document.querySelector('[data-toggle]') as HTMLElement;

            button.click();

            expect(consoleSpy).toHaveBeenCalledWith(
                '[DataToggle] Target element not found for selector: .non-existent'
            );
            expect(document.documentElement.classList.contains('test')).toBe(false);

            toggle.destroy();
        });

        test('should use custom default target from config', () => {
            document.body.innerHTML = `
        <div id="custom-target"></div>
        <button data-toggle="active">Toggle</button>
      `;

            const customTarget = document.getElementById('custom-target')!;
            const toggle = createDataToggle({defaultTarget: customTarget});
            const button = document.querySelector('[data-toggle]') as HTMLElement;

            button.click();

            expect(customTarget.classList.contains('active')).toBe(true);
            expect(document.documentElement.classList.contains('active')).toBe(false);

            toggle.destroy();
        });
    });

    describe('Custom attributes', () => {
        test('should work with custom toggle attribute', () => {
            document.body.innerHTML = `
        <button data-my-toggle="custom-class">Toggle</button>
      `;

            const toggle = createDataToggle({
                toggleAttribute: 'data-my-toggle'
            });
            const button = document.querySelector('[data-my-toggle]') as HTMLElement;

            button.click();

            expect(document.documentElement.classList.contains('custom-class')).toBe(true);

            toggle.destroy();
        });

        test('should work with custom element attribute', () => {
            document.body.innerHTML = `
        <div class="target"></div>
        <button data-toggle="active" data-my-element=".target">Toggle</button>
      `;

            const toggle = createDataToggle({
                elementAttribute: 'data-my-element'
            });
            const button = document.querySelector('[data-toggle]') as HTMLElement;
            const target = document.querySelector('.target') as HTMLElement;

            button.click();

            expect(target.classList.contains('active')).toBe(true);
            expect(document.documentElement.classList.contains('active')).toBe(false);

            toggle.destroy();
        });

        test('should auto-update selector when custom toggle attribute provided', () => {
            document.body.innerHTML = `
        <button data-custom="test-class">Toggle</button>
      `;

            const toggle = createDataToggle({
                toggleAttribute: 'data-custom'
            });
            const button = document.querySelector('[data-custom]') as HTMLElement;

            button.click();

            expect(document.documentElement.classList.contains('test-class')).toBe(true);

            toggle.destroy();
        });
    });

    describe('Programmatic API', () => {
        test('should programmatically toggle classes', () => {
            const toggle = createDataToggle();

            toggle.toggle('programmatic-class');
            expect(document.documentElement.classList.contains('programmatic-class')).toBe(true);

            toggle.toggle('programmatic-class');
            expect(document.documentElement.classList.contains('programmatic-class')).toBe(false);

            toggle.destroy();
        });

        test('should programmatically toggle on specific elements', () => {
            document.body.innerHTML = `<div class="target"></div>`;

            const toggle = createDataToggle();
            const target = document.querySelector('.target') as HTMLElement;

            toggle.toggle('active', '.target');
            expect(target.classList.contains('active')).toBe(true);
            expect(document.documentElement.classList.contains('active')).toBe(false);

            toggle.destroy();
        });

        test('should check if classes are active', () => {
            const toggle = createDataToggle();

            expect(toggle.isActive('non-existent')).toBe(false);

            toggle.toggle('active-class');
            expect(toggle.isActive('active-class')).toBe(true);

            toggle.toggle('active-class');
            expect(toggle.isActive('active-class')).toBe(false);

            toggle.destroy();
        });

        test('should check if classes are active on specific elements', () => {
            document.body.innerHTML = `<div class="target"></div>`;

            const toggle = createDataToggle();

            expect(toggle.isActive('active', '.target')).toBe(false);

            toggle.toggle('active', '.target');
            expect(toggle.isActive('active', '.target')).toBe(true);
            expect(toggle.isActive('active')).toBe(false); // Not on default target

            toggle.destroy();
        });
    });

    describe('Event dispatching', () => {
        test('should dispatch custom datatoggle events', () => {
            const eventListener = jest.fn();
            document.addEventListener('datatoggle', eventListener);

            document.body.innerHTML = `
        <button data-toggle="event-test">Toggle</button>
      `;

            const toggle = createDataToggle();
            const button = document.querySelector('[data-toggle]') as HTMLElement;

            button.click();

            expect(eventListener).toHaveBeenCalledTimes(1);
            expect(eventListener).toHaveBeenCalledWith(
                expect.objectContaining({
                    detail: expect.objectContaining({
                        className: 'event-test',
                        target: document.documentElement,
                        trigger: button,
                        active: true
                    })
                })
            );

            document.removeEventListener('datatoggle', eventListener);
            toggle.destroy();
        });

        test('should dispatch events for programmatic toggles', () => {
            const eventListener = jest.fn();
            document.addEventListener('datatoggle', eventListener);

            const toggle = createDataToggle();
            toggle.toggle('programmatic');

            expect(eventListener).toHaveBeenCalledWith(
                expect.objectContaining({
                    detail: expect.objectContaining({
                        className: 'programmatic',
                        target: document.documentElement,
                        trigger: null, // No trigger for programmatic
                        active: true
                    })
                })
            );

            document.removeEventListener('datatoggle', eventListener);
            toggle.destroy();
        });
    });

    describe('Configuration options', () => {
        test('should prevent default for links when preventDefault is auto', () => {
            document.body.innerHTML = `
        <a href="#" data-toggle="link-test">Toggle Link</a>
      `;

            const toggle = createDataToggle({preventDefault: 'auto'});
            const link = document.querySelector('[data-toggle]') as HTMLElement;

            const event = new MouseEvent('click', {bubbles: true, cancelable: true});
            const preventDefaultSpy = jest.spyOn(event, 'preventDefault');

            link.dispatchEvent(event);

            expect(preventDefaultSpy).toHaveBeenCalled();

            toggle.destroy();
        });

        test('should not prevent default for divs when preventDefault is auto', () => {
            document.body.innerHTML = `
        <div data-toggle="div-test">Toggle Div</div>
      `;

            const toggle = createDataToggle({preventDefault: 'auto'});
            const div = document.querySelector('[data-toggle]') as HTMLElement;

            const event = new MouseEvent('click', {bubbles: true, cancelable: true});
            const preventDefaultSpy = jest.spyOn(event, 'preventDefault');

            div.dispatchEvent(event);

            expect(preventDefaultSpy).not.toHaveBeenCalled();

            toggle.destroy();
        });

        test('should always prevent default when preventDefault is true', () => {
            document.body.innerHTML = `
        <div data-toggle="always-prevent">Toggle</div>
      `;

            const toggle = createDataToggle({preventDefault: true});
            const div = document.querySelector('[data-toggle]') as HTMLElement;

            const event = new MouseEvent('click', {bubbles: true, cancelable: true});
            const preventDefaultSpy = jest.spyOn(event, 'preventDefault');

            div.dispatchEvent(event);

            expect(preventDefaultSpy).toHaveBeenCalled();

            toggle.destroy();
        });

        test('should use internal debounce when debounceDelay is set', (done) => {
            document.body.innerHTML = `
        <button data-toggle="debounced">Toggle</button>
      `;

            const toggle = createDataToggle({debounceDelay: 50});
            const button = document.querySelector('[data-toggle]') as HTMLElement;

            // Click multiple times rapidly
            button.click();
            button.click();
            button.click();

            // Should not toggle immediately due to debouncing
            expect(document.documentElement.classList.contains('debounced')).toBe(false);

            // Wait for debounce delay + some buffer
            setTimeout(() => {
                // Should toggle only once after debounce delay
                expect(document.documentElement.classList.contains('debounced')).toBe(true);
                toggle.destroy();
                done();
            }, 100);
        }, 10000); // Increase timeout to 10 seconds
    });

    describe('Instance management', () => {
        test('should refresh and rebind events to new elements', () => {
            const toggle = createDataToggle();

            // Add new element after initialization
            document.body.innerHTML = `
        <button data-toggle="new-element">New Toggle</button>
      `;

            // Element shouldn't work before refresh
            const button = document.querySelector('[data-toggle]') as HTMLElement;
            button.click();
            expect(document.documentElement.classList.contains('new-element')).toBe(false);

            // Refresh should make it work
            toggle.refresh();
            button.click();
            expect(document.documentElement.classList.contains('new-element')).toBe(true);

            toggle.destroy();
        });

        test('should properly destroy instance and remove event listeners', () => {
            document.body.innerHTML = `
        <button data-toggle="destroy-test">Toggle</button>
      `;

            const toggle = createDataToggle();
            const button = document.querySelector('[data-toggle]') as HTMLElement;

            // Should work before destroy
            button.click();
            expect(document.documentElement.classList.contains('destroy-test')).toBe(true);

            // Clear the class for clean test
            document.documentElement.classList.remove('destroy-test');

            // Destroy instance
            toggle.destroy();

            // Should not work after destroy
            button.click();
            expect(document.documentElement.classList.contains('destroy-test')).toBe(false);

            // Programmatic methods should warn and not work
            const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

            toggle.toggle('should-not-work');
            expect(consoleSpy).toHaveBeenCalledWith('[DataToggle] Cannot toggle on destroyed instance');
            expect(document.documentElement.classList.contains('should-not-work')).toBe(false);

            expect(toggle.isActive('anything')).toBe(false);
            expect(consoleSpy).toHaveBeenCalledWith('[DataToggle] Cannot check state on destroyed instance');
        });

        test('should handle multiple instances independently', () => {
            document.body.innerHTML = `
        <button data-toggle="instance1">Instance 1</button>
        <button data-custom="instance2">Instance 2</button>
      `;

            const toggle1 = createDataToggle();
            const toggle2 = createDataToggle({toggleAttribute: 'data-custom'});

            const button1 = document.querySelector('[data-toggle]') as HTMLElement;
            const button2 = document.querySelector('[data-custom]') as HTMLElement;

            button1.click();
            button2.click();

            expect(document.documentElement.classList.contains('instance1')).toBe(true);
            expect(document.documentElement.classList.contains('instance2')).toBe(true);

            // Destroy only first instance
            toggle1.destroy();

            // Clear classes
            document.documentElement.classList.remove('instance1', 'instance2');

            // First should not work, second should still work
            button1.click();
            button2.click();

            expect(document.documentElement.classList.contains('instance1')).toBe(false);
            expect(document.documentElement.classList.contains('instance2')).toBe(true);

            toggle2.destroy();
        });
    });

    describe('Error handling', () => {
        test('should handle empty or invalid class names gracefully', () => {
            document.body.innerHTML = `
        <button data-toggle="">Empty</button>
        <button data-toggle="  ">Whitespace</button>
      `;

            const toggle = createDataToggle({debug: true});
            const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

            const emptyButton = document.querySelector('[data-toggle=""]') as HTMLElement;
            const whitespaceButton = document.querySelector('[data-toggle="  "]') as HTMLElement;

            emptyButton.click();
            whitespaceButton.click();

            expect(consoleSpy).toHaveBeenCalledWith('[DataToggle]', 'No class name found in data-toggle attribute');
            expect(document.documentElement.className).toBe('');

            toggle.destroy();
        });

        test('should warn when programmatic toggle targets non-existent elements', () => {
            const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

            const toggle = createDataToggle();

            toggle.toggle('test', '.non-existent');
            expect(consoleSpy).toHaveBeenCalledWith('[DataToggle] Element not found for selector: .non-existent');

            expect(toggle.isActive('test', '.non-existent')).toBe(false);
            expect(consoleSpy).toHaveBeenCalledWith('[DataToggle] Element not found for selector: .non-existent');

            toggle.destroy();
        });

        test('should warn when providing invalid class names to programmatic methods', () => {
            const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

            const toggle = createDataToggle();

            toggle.toggle('');
            toggle.toggle('   ');

            expect(consoleSpy).toHaveBeenCalledWith('[DataToggle] Invalid class name provided');
            expect(consoleSpy).toHaveBeenCalledTimes(2);

            toggle.destroy();
        });
    });
});