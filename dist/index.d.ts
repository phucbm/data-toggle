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

declare const createDataToggle: (config?: DataToggleConfig) => DataToggleInstance;

export { createDataToggle };
export type { DataToggleConfig, DataToggleEventDetail, DataToggleInstance, DataToggleSource };
