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
    /** Programmatically toggle one or more classes (comma-separated) on a specific element */
    toggle(className: string, elementSelector?: string): void;
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
declare const createDataToggle: (config?: DataToggleConfig) => DataToggleInstance;

export { createDataToggle };
