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
    /** Keep aria-expanded (and aria-controls) on button and link triggers in step with their classes. Defaults to false */
    aria?: boolean;
    /** Close active toggles with the Escape key. Per trigger: data-toggle-escape / data-toggle-escape="false". Defaults to false */
    escape?: boolean;
    /** Data attribute name for the per-trigger Escape setting. Defaults to 'data-toggle-escape' */
    escapeAttribute?: string;
}

/** What changed the classes: a click on a trigger, the toggle() method, or the Escape key */
type DataToggleSource = 'click' | 'api' | 'escape';

interface DataToggleEventDetail {
    classNames: string[];
    target: Element;
    /** Trigger that was clicked, or whose classes Escape closed; null for toggle() */
    trigger: Element | null;
    active: boolean;
    source: DataToggleSource;
}

interface DataToggleInstance {
    /** Destroy the toggle instance and remove ALL event listeners for this instance */
    destroy(): void;

    /** Programmatically toggle one or more classes (comma-separated) on a specific element; force true adds, false removes */
    toggle(className: string, elementSelector?: string, force?: boolean): void;

    /** Check if one or more classes (comma-separated) are all currently active */
    isActive(className: string, elementSelector?: string): boolean;

    /** Refresh the instance - use when DOM changes and new [data-toggle] elements are added */
    refresh(): void;
}

/**
 * Creates a new data toggle instance
 * @param config - Configuration options
 * @returns DataToggleInstance with control methods
 */
export type {DataToggleConfig, DataToggleInstance, DataToggleEventDetail, DataToggleSource};

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
        aria: false,
        escape: false,
        escapeAttribute: 'data-toggle-escape',
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
     * Simple debounce implementation
     */
    const debounce = (func: Function, delay: number) => {
        let timeoutId: number;
        return (event: Event) => {
            // Preserve the event and target for later use
            const target = event.currentTarget as Element;
            const preservedEvent = {
                ...event,
                currentTarget: target,
                preventDefault: () => event.preventDefault()
            };

            clearTimeout(timeoutId);
            timeoutId = window.setTimeout(() => {
                func(preservedEvent);
            }, delay);
        };
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

    const parseClassNames = (value: string | null): string[] =>
        (value || '').split(',').map(c => c.trim()).filter(Boolean);

    /**
     * Target of a trigger without warnings, for state checks (aria, Escape)
     */
    const quietTarget = (toggleElement: Element): Element | null => {
        const elementSelector = toggleElement.getAttribute(options.elementAttribute);
        if (elementSelector) return document.querySelector(elementSelector);
        if (options.defaultElementSelector) {
            const defaultElement = document.querySelector(options.defaultElementSelector);
            if (defaultElement) return defaultElement;
        }
        return options.defaultTarget;
    };

    /**
     * aria-expanded only belongs on interactive triggers: a backdrop <div> gets none
     */
    const canHaveAria = (element: Element): boolean =>
        element.tagName === 'BUTTON' || element.tagName === 'A' || element.hasAttribute('role');

    /**
     * Set aria-expanded on every trigger from its target's classes, and aria-controls when the target has an id
     */
    const syncAria = () => {
        if (!options.aria) return;
        document.querySelectorAll(options.selector).forEach(trigger => {
            if (!canHaveAria(trigger)) return;
            const classNames = parseClassNames(trigger.getAttribute(options.toggleAttribute));
            const target = quietTarget(trigger);
            if (!classNames.length || !target) return;

            const expanded = classNames.every(cls => target.classList.contains(cls));
            trigger.setAttribute('aria-expanded', String(expanded));
            if (target.id && trigger.hasAttribute(options.elementAttribute) && !trigger.hasAttribute('aria-controls')) {
                trigger.setAttribute('aria-controls', target.id);
            }
        });
    };

    /**
     * Set the classes on or off together, then sync aria and dispatch the datatoggle event
     */
    const apply = (classNames: string[], target: Element, active: boolean, trigger: Element | null, source: DataToggleSource) => {
        classNames.forEach(cls => target.classList.toggle(cls, active));
        log(`${source}: classes "${classNames.join(', ')}" on`, target, active ? 'ON' : 'OFF');
        syncAria();

        const detail: DataToggleEventDetail = {classNames, target, trigger, active, source};
        document.dispatchEvent(new CustomEvent('datatoggle', {detail}));
    };

    /**
     * Whether Escape closes this trigger's classes: its own attribute first, then the escape option
     */
    const closesOnEscape = (trigger: Element): boolean => {
        const value = trigger.getAttribute(options.escapeAttribute);
        if (value === null) return options.escape;
        return value !== 'false';
    };

    /**
     * Escape: turn off every active toggle that allows it, once per target and classes
     */
    const handleKeydown = (event: KeyboardEvent) => {
        if (isDestroyed || event.key !== 'Escape') return;

        const done = new Map<Element, Set<string>>();
        document.querySelectorAll(options.selector).forEach(trigger => {
            if (!closesOnEscape(trigger)) return;
            const classNames = parseClassNames(trigger.getAttribute(options.toggleAttribute));
            const target = quietTarget(trigger);
            if (!classNames.length || !target) return;
            if (!classNames.every(cls => target.classList.contains(cls))) return;

            const key = classNames.join(',');
            const keys = done.get(target) || new Set<string>();
            if (keys.has(key)) return;
            keys.add(key);
            done.set(target, keys);

            apply(classNames, target, false, trigger, 'escape');
        });
    };

    /**
     * Handle toggle click events
     */
    const handleToggleClick = (event: Event) => {
        if (isDestroyed) return;

        const target = event.currentTarget as Element;
        if (!target) {
            log('No current target found in event');
            return;
        }

        const rawValue = target.getAttribute(options.toggleAttribute);

        if (!rawValue?.trim()) {
            log(`No class name found in ${options.toggleAttribute} attribute`);
            return;
        }

        const classNames = parseClassNames(rawValue);

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

        // Perform the toggle - all classes toggled together based on first class state
        const wasActive = toggleTarget.classList.contains(classNames[0]);
        apply(classNames, toggleTarget, !wasActive, target, 'click');
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
                ? debounce(handleToggleClick, options.debounceDelay)
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
            syncAria();
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
    document.addEventListener('keydown', handleKeydown);

    // Return the instance API
    return {
        destroy() {
            if (isDestroyed) {
                log('Instance already destroyed');
                return;
            }

            unbindEvents(); // Removes ALL event listeners for this instance
            document.removeEventListener('keydown', handleKeydown);
            isDestroyed = true;
            log('Instance destroyed - all event listeners removed');
        },

        toggle(className: string, elementSelector?: string, force?: boolean) {
            if (isDestroyed) {
                console.warn('[DataToggle] Cannot toggle on destroyed instance');
                return;
            }

            if (!className?.trim()) {
                console.warn('[DataToggle] Invalid class name provided');
                return;
            }

            const classNames = parseClassNames(className);

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

            const wasActive = targetElement.classList.contains(classNames[0]);
            const active = force === undefined ? !wasActive : force;

            // force with nothing to change: no event
            if (force !== undefined && classNames.every(cls => targetElement.classList.contains(cls) === force)) {
                return;
            }

            apply(classNames, targetElement, active, null, 'api');
        },

        isActive(className: string, elementSelector?: string): boolean {
            if (isDestroyed) {
                console.warn('[DataToggle] Cannot check state on destroyed instance');
                return false;
            }

            const classNames = parseClassNames(className);

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

            // Returns true only if ALL classes are active
            return classNames.every(cls => targetElement.classList.contains(cls));
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