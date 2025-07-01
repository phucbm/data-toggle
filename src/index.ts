import _ from 'lodash';

interface DataToggleConfig {
    /** CSS selector for toggle elements. Defaults to '[data-toggle]' */
    selector?: string;
    /** Data attribute name for toggle. Defaults to 'data-toggle' */
    toggleAttribute?: string;
    /** Data attribute name for element selector. Defaults to 'data-toggle-element' */
    elementAttribute?: string;
    /** Default target element for toggles. Defaults to document.documentElement (html) */
    defaultTarget?: Element;
    /** Default element selector fallback */
    defaultElementSelector?: string;
    /** Whether to prevent default action on click. Defaults to 'auto' */
    preventDefault?: boolean | 'auto';
    /** Enable debug logging */
    debug?: boolean;
    /** Debounce delay in milliseconds. Defaults to 0 (no debouncing) */
    debounceDelay?: number;
}

interface DataToggleInstance {
    /** Destroy the toggle instance and remove ALL event listeners for this instance */
    destroy(): void;

    /** Programmatically toggle a class on specific element by its data-toggle value */
    toggle(className: string, elementSelector?: string): void;

    /** Check if a class is currently active for a specific data-toggle element */
    isActive(className: string, elementSelector?: string): boolean;

    /** Refresh the instance - use when DOM changes and new [data-toggle] elements are added */
    refresh(): void;
}

/**
 * Creates a new data toggle instance
 * @param config - Configuration options
 * @returns DataToggleInstance with control methods
 */
export const createDataToggle = (config: DataToggleConfig = {}): DataToggleInstance => {
    const options: Required<DataToggleConfig> = {
        selector: '[data-toggle]',
        toggleAttribute: 'data-toggle',
        elementAttribute: 'data-toggle-element',
        defaultTarget: document.documentElement,
        defaultElementSelector: '',
        preventDefault: 'auto',
        debug: false,
        debounceDelay: 0,
        ...config
    };

    // Update selector if custom toggle attribute is provided
    if (config.toggleAttribute && !config.selector) {
        options.selector = `[${config.toggleAttribute}]`;
    }

    let isDestroyed = false;
    const boundHandlers = new WeakMap<Element, EventListener>();

    /**
     * Log debug messages if debug mode is enabled
     */
    const log = (...args: any[]) => {
        if (options.debug) {
            console.log('[DataToggle]', ...args);
        }
    };

    /**
     * Validate that required elements exist
     */
    const validateElements = (): boolean => {
        if (!options.defaultTarget) {
            console.error('[DataToggle] Default target element not found');
            return false;
        }
        return true;
    };

    /**
     * Find the target element for a specific toggle element
     */
    const findToggleTarget = (toggleElement: Element): Element | null => {
        // Check for element selector attribute
        const elementSelector = toggleElement.getAttribute(options.elementAttribute);
        if (elementSelector) {
            const targetElement = document.querySelector(elementSelector);
            if (targetElement) {
                return targetElement;
            } else {
                console.warn(`[DataToggle] Target element not found for selector: ${elementSelector}`);
                return null;
            }
        }

        // Use default element selector from config
        if (options.defaultElementSelector) {
            const defaultElement = document.querySelector(options.defaultElementSelector);
            if (defaultElement) {
                return defaultElement;
            }
        }

        // Final fallback to default target
        return options.defaultTarget;
    };

    /**
     * Handle toggle click events
     */
    const handleToggleClick = (event: Event) => {
        if (isDestroyed) return;

        const target = event.currentTarget as Element;
        const className = target.getAttribute(options.toggleAttribute);

        if (!className?.trim()) {
            log(`No class name found in ${options.toggleAttribute} attribute`);
            return;
        }

        // Determine if we should prevent default
        let shouldPreventDefault = options.preventDefault;
        if (shouldPreventDefault === 'auto') {
            // Prevent default for links and buttons, but not for other elements
            shouldPreventDefault = target.tagName === 'A' || target.tagName === 'BUTTON';
        }

        if (shouldPreventDefault) {
            event.preventDefault();
        }

        // Find the target element to toggle
        const toggleTarget = findToggleTarget(target);
        if (!toggleTarget) {
            return;
        }

        // Perform the toggle
        const wasActive = toggleTarget.classList.contains(className);
        toggleTarget.classList.toggle(className);

        log(`Toggled class "${className}" on`, toggleTarget, wasActive ? 'OFF' : 'ON');

        // Dispatch custom event
        const toggleEvent = new CustomEvent('datatoggle', {
            detail: {
                className,
                target: toggleTarget,
                trigger: target,
                active: !wasActive
            }
        });
        document.dispatchEvent(toggleEvent);
    };

    /**
     * Add event listeners to toggle elements
     */
    const bindEvents = () => {
        if (!validateElements()) return;

        try {
            const toggleElements = document.querySelectorAll(options.selector);

            if (toggleElements.length === 0) {
                log(`No toggle elements found with selector: ${options.selector}`);
                return;
            }

            const clickHandler = options.debounceDelay > 0
                ? _.debounce(handleToggleClick, options.debounceDelay)
                : handleToggleClick;

            toggleElements.forEach(element => {
                // Remove existing handler if any
                const existingHandler = boundHandlers.get(element);
                if (existingHandler) {
                    element.removeEventListener('click', existingHandler);
                }

                // Add new handler
                element.addEventListener('click', clickHandler);
                boundHandlers.set(element, clickHandler);
            });

            log(`Bound events to ${toggleElements.length} elements`);
        } catch (error) {
            console.error('[DataToggle] Error binding events:', error);
        }
    };

    /**
     * Remove all event listeners
     */
    const unbindEvents = () => {
        try {
            const toggleElements = document.querySelectorAll(options.selector);
            toggleElements.forEach(element => {
                const handler = boundHandlers.get(element);
                if (handler) {
                    element.removeEventListener('click', handler);
                    boundHandlers.delete(element);
                }
            });
            log('Unbound all events');
        } catch (error) {
            console.error('[DataToggle] Error unbinding events:', error);
        }
    };

    // Initialize
    bindEvents();

    // Return the instance API
    return {
        destroy() {
            if (isDestroyed) {
                log('Instance already destroyed');
                return;
            }

            unbindEvents(); // Removes ALL event listeners for this instance
            isDestroyed = true;
            log('Instance destroyed - all event listeners removed');
        },

        toggle(className: string, elementSelector?: string) {
            if (isDestroyed) {
                console.warn('[DataToggle] Cannot toggle on destroyed instance');
                return;
            }

            if (!className?.trim()) {
                console.warn('[DataToggle] Invalid class name provided');
                return;
            }

            let targetElement: Element;

            if (elementSelector) {
                // Find target by selector
                const element = document.querySelector(elementSelector);
                if (!element) {
                    console.warn(`[DataToggle] Element not found for selector: ${elementSelector}`);
                    return;
                }
                targetElement = element;
            } else {
                // Use default target
                targetElement = options.defaultTarget;
            }

            const wasActive = targetElement.classList.contains(className);
            targetElement.classList.toggle(className);

            log(`Programmatically toggled "${className}" on`, targetElement, wasActive ? 'OFF' : 'ON');

            // Dispatch custom event
            const toggleEvent = new CustomEvent('datatoggle', {
                detail: {
                    className,
                    target: targetElement,
                    trigger: null, // No trigger for programmatic toggles
                    active: !wasActive
                }
            });
            document.dispatchEvent(toggleEvent);
        },

        isActive(className: string, elementSelector?: string): boolean {
            if (isDestroyed) {
                console.warn('[DataToggle] Cannot check state on destroyed instance');
                return false;
            }

            let targetElement: Element;

            if (elementSelector) {
                // Find target by selector
                const element = document.querySelector(elementSelector);
                if (!element) {
                    console.warn(`[DataToggle] Element not found for selector: ${elementSelector}`);
                    return false;
                }
                targetElement = element;
            } else {
                // Use default target
                targetElement = options.defaultTarget;
            }

            return targetElement.classList.contains(className);
        },

        refresh() {
            if (isDestroyed) {
                console.warn('[DataToggle] Cannot refresh destroyed instance');
                return;
            }

            log('Refreshing instance - rescanning for new toggle elements');
            unbindEvents();
            bindEvents();
        }
    };
};