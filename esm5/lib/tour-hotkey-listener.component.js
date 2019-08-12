/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
import { Component, HostListener } from '@angular/core';
import { TourService, TourState } from './tour.service';
var TourHotkeyListenerComponent = /** @class */ (function () {
    function TourHotkeyListenerComponent(tourService) {
        this.tourService = tourService;
    }
    /**
     * Configures hot keys for controlling the tour with the keyboard
     */
    /**
     * Configures hot keys for controlling the tour with the keyboard
     * @return {?}
     */
    TourHotkeyListenerComponent.prototype.onEscapeKey = /**
     * Configures hot keys for controlling the tour with the keyboard
     * @return {?}
     */
    function () {
        if (this.tourService.getStatus() === TourState.ON &&
            this.tourService.isHotkeysEnabled()) {
            this.tourService.end();
        }
    };
    /**
     * @return {?}
     */
    TourHotkeyListenerComponent.prototype.onArrowRightKey = /**
     * @return {?}
     */
    function () {
        if (this.tourService.getStatus() === TourState.ON &&
            this.tourService.hasNext(this.tourService.currentStep) &&
            this.tourService.isHotkeysEnabled()) {
            this.tourService.next();
        }
    };
    /**
     * @return {?}
     */
    TourHotkeyListenerComponent.prototype.onArrowLeftKey = /**
     * @return {?}
     */
    function () {
        if (this.tourService.getStatus() === TourState.ON &&
            this.tourService.hasPrev(this.tourService.currentStep) &&
            this.tourService.isHotkeysEnabled()) {
            this.tourService.prev();
        }
    };
    TourHotkeyListenerComponent.decorators = [
        { type: Component, args: [{
                    selector: 'tour-hotkey-listener',
                    template: "<ng-content></ng-content>"
                }] }
    ];
    /** @nocollapse */
    TourHotkeyListenerComponent.ctorParameters = function () { return [
        { type: TourService }
    ]; };
    TourHotkeyListenerComponent.propDecorators = {
        onEscapeKey: [{ type: HostListener, args: ['window:keydown.Escape',] }],
        onArrowRightKey: [{ type: HostListener, args: ['window:keydown.ArrowRight',] }],
        onArrowLeftKey: [{ type: HostListener, args: ['window:keydown.ArrowLeft',] }]
    };
    return TourHotkeyListenerComponent;
}());
export { TourHotkeyListenerComponent };
if (false) {
    /** @type {?} */
    TourHotkeyListenerComponent.prototype.tourService;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG91ci1ob3RrZXktbGlzdGVuZXIuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6Im5nOi8vbmd4LXRvdXItY29yZS8iLCJzb3VyY2VzIjpbImxpYi90b3VyLWhvdGtleS1saXN0ZW5lci5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQUUsWUFBWSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBRXhELE9BQU8sRUFBRSxXQUFXLEVBQUUsU0FBUyxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFFeEQ7SUFLRSxxQ0FBbUIsV0FBd0I7UUFBeEIsZ0JBQVcsR0FBWCxXQUFXLENBQWE7SUFBRyxDQUFDO0lBRS9DOztPQUVHOzs7OztJQUVJLGlEQUFXOzs7O0lBRGxCO1FBRUUsSUFDRSxJQUFJLENBQUMsV0FBVyxDQUFDLFNBQVMsRUFBRSxLQUFLLFNBQVMsQ0FBQyxFQUFFO1lBQzdDLElBQUksQ0FBQyxXQUFXLENBQUMsZ0JBQWdCLEVBQUUsRUFDbkM7WUFDQSxJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsRUFBRSxDQUFDO1NBQ3hCO0lBQ0gsQ0FBQzs7OztJQUdNLHFEQUFlOzs7SUFEdEI7UUFFRSxJQUNFLElBQUksQ0FBQyxXQUFXLENBQUMsU0FBUyxFQUFFLEtBQUssU0FBUyxDQUFDLEVBQUU7WUFDN0MsSUFBSSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxXQUFXLENBQUM7WUFDdEQsSUFBSSxDQUFDLFdBQVcsQ0FBQyxnQkFBZ0IsRUFBRSxFQUNuQztZQUNBLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLENBQUM7U0FDekI7SUFDSCxDQUFDOzs7O0lBR00sb0RBQWM7OztJQURyQjtRQUVFLElBQ0UsSUFBSSxDQUFDLFdBQVcsQ0FBQyxTQUFTLEVBQUUsS0FBSyxTQUFTLENBQUMsRUFBRTtZQUM3QyxJQUFJLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLFdBQVcsQ0FBQztZQUN0RCxJQUFJLENBQUMsV0FBVyxDQUFDLGdCQUFnQixFQUFFLEVBQ25DO1lBQ0EsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsQ0FBQztTQUN6QjtJQUNILENBQUM7O2dCQXhDRixTQUFTLFNBQUM7b0JBQ1QsUUFBUSxFQUFFLHNCQUFzQjtvQkFDaEMsUUFBUSxFQUFFLDJCQUEyQjtpQkFDdEM7Ozs7Z0JBTFEsV0FBVzs7OzhCQVlqQixZQUFZLFNBQUMsdUJBQXVCO2tDQVVwQyxZQUFZLFNBQUMsMkJBQTJCO2lDQVd4QyxZQUFZLFNBQUMsMEJBQTBCOztJQVUxQyxrQ0FBQztDQUFBLEFBekNELElBeUNDO1NBckNZLDJCQUEyQjs7O0lBQzFCLGtEQUErQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbXBvbmVudCwgSG9zdExpc3RlbmVyIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XHJcblxyXG5pbXBvcnQgeyBUb3VyU2VydmljZSwgVG91clN0YXRlIH0gZnJvbSAnLi90b3VyLnNlcnZpY2UnO1xyXG5cclxuQENvbXBvbmVudCh7XHJcbiAgc2VsZWN0b3I6ICd0b3VyLWhvdGtleS1saXN0ZW5lcicsXHJcbiAgdGVtcGxhdGU6IGA8bmctY29udGVudD48L25nLWNvbnRlbnQ+YFxyXG59KVxyXG5leHBvcnQgY2xhc3MgVG91ckhvdGtleUxpc3RlbmVyQ29tcG9uZW50IHtcclxuICBjb25zdHJ1Y3RvcihwdWJsaWMgdG91clNlcnZpY2U6IFRvdXJTZXJ2aWNlKSB7fVxyXG5cclxuICAvKipcclxuICAgKiBDb25maWd1cmVzIGhvdCBrZXlzIGZvciBjb250cm9sbGluZyB0aGUgdG91ciB3aXRoIHRoZSBrZXlib2FyZFxyXG4gICAqL1xyXG4gIEBIb3N0TGlzdGVuZXIoJ3dpbmRvdzprZXlkb3duLkVzY2FwZScpXHJcbiAgcHVibGljIG9uRXNjYXBlS2V5KCk6IHZvaWQge1xyXG4gICAgaWYgKFxyXG4gICAgICB0aGlzLnRvdXJTZXJ2aWNlLmdldFN0YXR1cygpID09PSBUb3VyU3RhdGUuT04gJiZcclxuICAgICAgdGhpcy50b3VyU2VydmljZS5pc0hvdGtleXNFbmFibGVkKClcclxuICAgICkge1xyXG4gICAgICB0aGlzLnRvdXJTZXJ2aWNlLmVuZCgpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgQEhvc3RMaXN0ZW5lcignd2luZG93OmtleWRvd24uQXJyb3dSaWdodCcpXHJcbiAgcHVibGljIG9uQXJyb3dSaWdodEtleSgpOiB2b2lkIHtcclxuICAgIGlmIChcclxuICAgICAgdGhpcy50b3VyU2VydmljZS5nZXRTdGF0dXMoKSA9PT0gVG91clN0YXRlLk9OICYmXHJcbiAgICAgIHRoaXMudG91clNlcnZpY2UuaGFzTmV4dCh0aGlzLnRvdXJTZXJ2aWNlLmN1cnJlbnRTdGVwKSAmJlxyXG4gICAgICB0aGlzLnRvdXJTZXJ2aWNlLmlzSG90a2V5c0VuYWJsZWQoKVxyXG4gICAgKSB7XHJcbiAgICAgIHRoaXMudG91clNlcnZpY2UubmV4dCgpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgQEhvc3RMaXN0ZW5lcignd2luZG93OmtleWRvd24uQXJyb3dMZWZ0JylcclxuICBwdWJsaWMgb25BcnJvd0xlZnRLZXkoKTogdm9pZCB7XHJcbiAgICBpZiAoXHJcbiAgICAgIHRoaXMudG91clNlcnZpY2UuZ2V0U3RhdHVzKCkgPT09IFRvdXJTdGF0ZS5PTiAmJlxyXG4gICAgICB0aGlzLnRvdXJTZXJ2aWNlLmhhc1ByZXYodGhpcy50b3VyU2VydmljZS5jdXJyZW50U3RlcCkgJiZcclxuICAgICAgdGhpcy50b3VyU2VydmljZS5pc0hvdGtleXNFbmFibGVkKClcclxuICAgICkge1xyXG4gICAgICB0aGlzLnRvdXJTZXJ2aWNlLnByZXYoKTtcclxuICAgIH1cclxuICB9XHJcbn1cclxuIl19