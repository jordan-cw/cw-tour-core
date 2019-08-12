/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
import { Injectable } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';
import { Subject, merge as mergeStatic } from 'rxjs';
import { first, map, filter } from 'rxjs/operators';
/**
 * @record
 */
export function IStepOption() { }
if (false) {
    /** @type {?|undefined} */
    IStepOption.prototype.stepId;
    /** @type {?|undefined} */
    IStepOption.prototype.anchorId;
    /** @type {?|undefined} */
    IStepOption.prototype.title;
    /** @type {?|undefined} */
    IStepOption.prototype.content;
    /** @type {?|undefined} */
    IStepOption.prototype.route;
    /** @type {?|undefined} */
    IStepOption.prototype.nextStep;
    /** @type {?|undefined} */
    IStepOption.prototype.prevStep;
    /** @type {?|undefined} */
    IStepOption.prototype.placement;
    /** @type {?|undefined} */
    IStepOption.prototype.preventScrolling;
    /** @type {?|undefined} */
    IStepOption.prototype.prevBtnTitle;
    /** @type {?|undefined} */
    IStepOption.prototype.nextBtnTitle;
    /** @type {?|undefined} */
    IStepOption.prototype.endBtnTitle;
}
/** @enum {number} */
var TourState = {
    OFF: 0,
    ON: 1,
    PAUSED: 2,
};
export { TourState };
TourState[TourState.OFF] = 'OFF';
TourState[TourState.ON] = 'ON';
TourState[TourState.PAUSED] = 'PAUSED';
/** @enum {number} */
var TourDirection = {
    None: 0,
    Next: 1,
    Previous: 2,
};
export { TourDirection };
TourDirection[TourDirection.None] = 'None';
TourDirection[TourDirection.Next] = 'Next';
TourDirection[TourDirection.Previous] = 'Previous';
/**
 * @template T
 */
var TourService = /** @class */ (function () {
    function TourService(router) {
        this.router = router;
        this.stepShow$ = new Subject();
        this.stepHide$ = new Subject();
        this.initialize$ = new Subject();
        this.start$ = new Subject();
        this.end$ = new Subject();
        this.pause$ = new Subject();
        this.resume$ = new Subject();
        this.anchorRegister$ = new Subject();
        this.anchorUnregister$ = new Subject();
        this.events$ = mergeStatic(this.stepShow$.pipe(map(function (value) { return ({ name: 'stepShow', value: value }); })), this.stepHide$.pipe(map(function (value) { return ({ name: 'stepHide', value: value }); })), this.initialize$.pipe(map(function (value) { return ({ name: 'initialize', value: value }); })), this.start$.pipe(map(function (value) { return ({ name: 'start', value: value }); })), this.end$.pipe(map(function (value) { return ({ name: 'end', value: value }); })), this.pause$.pipe(map(function (value) { return ({ name: 'pause', value: value }); })), this.resume$.pipe(map(function (value) { return ({ name: 'resume', value: value }); })), this.anchorRegister$.pipe(map(function (value) { return ({
            name: 'anchorRegister',
            value: value
        }); })), this.anchorUnregister$.pipe(map(function (value) { return ({
            name: 'anchorUnregister',
            value: value
        }); })));
        this.steps = [];
        this.anchors = {};
        this.status = TourState.OFF;
        this.isHotKeysEnabled = true;
        this.direction = TourDirection.Next;
    }
    /**
     * @param {?} steps
     * @param {?=} stepDefaults
     * @return {?}
     */
    TourService.prototype.initialize = /**
     * @param {?} steps
     * @param {?=} stepDefaults
     * @return {?}
     */
    function (steps, stepDefaults) {
        if (steps && steps.length > 0) {
            this.status = TourState.OFF;
            this.steps = steps.map(function (step) { return Object.assign({}, stepDefaults, step); });
            this.initialize$.next(this.steps);
        }
    };
    /**
     * @return {?}
     */
    TourService.prototype.disableHotkeys = /**
     * @return {?}
     */
    function () {
        this.isHotKeysEnabled = false;
    };
    /**
     * @return {?}
     */
    TourService.prototype.enableHotkeys = /**
     * @return {?}
     */
    function () {
        this.isHotKeysEnabled = true;
    };
    /**
     * @return {?}
     */
    TourService.prototype.start = /**
     * @return {?}
     */
    function () {
        this.startAt(0);
    };
    /**
     * @param {?} stepId
     * @return {?}
     */
    TourService.prototype.startAt = /**
     * @param {?} stepId
     * @return {?}
     */
    function (stepId) {
        var _this = this;
        this.status = TourState.ON;
        this.goToStep(this.loadStep(stepId));
        this.start$.next();
        this.router.events
            .pipe(filter(function (event) { return event instanceof NavigationStart; }), first())
            .subscribe(function () {
            if (_this.currentStep && _this.currentStep.hasOwnProperty('route')) {
                _this.hideStep(_this.currentStep);
            }
        });
    };
    /**
     * @return {?}
     */
    TourService.prototype.end = /**
     * @return {?}
     */
    function () {
        this.status = TourState.OFF;
        this.hideStep(this.currentStep);
        this.currentStep = undefined;
        this.end$.next();
        this.direction = TourDirection.Next;
    };
    /**
     * @return {?}
     */
    TourService.prototype.pause = /**
     * @return {?}
     */
    function () {
        this.status = TourState.PAUSED;
        this.hideStep(this.currentStep);
        this.pause$.next();
    };
    /**
     * @return {?}
     */
    TourService.prototype.resume = /**
     * @return {?}
     */
    function () {
        this.status = TourState.ON;
        this.showStep(this.currentStep);
        this.resume$.next();
    };
    /**
     * @param {?=} pause
     * @return {?}
     */
    TourService.prototype.toggle = /**
     * @param {?=} pause
     * @return {?}
     */
    function (pause) {
        if (pause) {
            if (this.currentStep) {
                this.pause();
            }
            else {
                this.resume();
            }
        }
        else {
            if (this.currentStep) {
                this.end();
            }
            else {
                this.start();
            }
        }
    };
    /**
     * @return {?}
     */
    TourService.prototype.next = /**
     * @return {?}
     */
    function () {
        this.direction = TourDirection.Next;
        if (this.hasNext(this.currentStep)) {
            this.goToStep(this.loadStep(this.currentStep.nextStep || this.steps.indexOf(this.currentStep) + 1));
        }
        else {
            this.end();
            return;
        }
    };
    /**
     * @param {?} step
     * @return {?}
     */
    TourService.prototype.hasNext = /**
     * @param {?} step
     * @return {?}
     */
    function (step) {
        if (!step) {
            // console.warn('Can\'t get next step. No currentStep.');
            return false;
        }
        return (step.nextStep !== undefined ||
            this.steps.indexOf(step) < this.steps.length - 1);
    };
    /**
     * @return {?}
     */
    TourService.prototype.prev = /**
     * @return {?}
     */
    function () {
        this.direction = TourDirection.Previous;
        if (this.hasPrev(this.currentStep)) {
            this.goToStep(this.loadStep(this.currentStep.prevStep || this.steps.indexOf(this.currentStep) - 1));
        }
        else {
            this.end();
            return;
        }
    };
    /**
     * @param {?} step
     * @return {?}
     */
    TourService.prototype.hasPrev = /**
     * @param {?} step
     * @return {?}
     */
    function (step) {
        if (!step) {
            // console.warn('Can\'t get previous step. No currentStep.');
            return false;
        }
        return step.prevStep !== undefined || this.steps.indexOf(step) > 0;
    };
    /**
     * @param {?} stepId
     * @return {?}
     */
    TourService.prototype.goto = /**
     * @param {?} stepId
     * @return {?}
     */
    function (stepId) {
        this.goToStep(this.loadStep(stepId));
    };
    /**
     * @param {?} anchorId
     * @param {?} anchor
     * @return {?}
     */
    TourService.prototype.register = /**
     * @param {?} anchorId
     * @param {?} anchor
     * @return {?}
     */
    function (anchorId, anchor) {
        if (!anchorId)
            return;
        if (this.anchors[anchorId]) {
            throw new Error('anchorId ' + anchorId + ' already registered!');
        }
        this.anchors[anchorId] = anchor;
        this.anchorRegister$.next(anchorId);
    };
    /**
     * @param {?} anchorId
     * @return {?}
     */
    TourService.prototype.unregister = /**
     * @param {?} anchorId
     * @return {?}
     */
    function (anchorId) {
        if (!anchorId)
            return;
        delete this.anchors[anchorId];
        this.anchorUnregister$.next(anchorId);
    };
    /**
     * @return {?}
     */
    TourService.prototype.getStatus = /**
     * @return {?}
     */
    function () {
        return this.status;
    };
    /**
     * @return {?}
     */
    TourService.prototype.isHotkeysEnabled = /**
     * @return {?}
     */
    function () {
        return this.isHotKeysEnabled;
    };
    /**
     * @private
     * @param {?} step
     * @return {?}
     */
    TourService.prototype.goToStep = /**
     * @private
     * @param {?} step
     * @return {?}
     */
    function (step) {
        var _this = this;
        if (!step) {
            // console.warn('Can\'t go to non-existent step');
            this.end();
            return;
        }
        /** @type {?} */
        var navigatePromise = new Promise(function (resolve) {
            return resolve(true);
        });
        if (step.route !== undefined && typeof step.route === 'string') {
            navigatePromise = this.router.navigateByUrl(step.route);
        }
        else if (step.route && Array.isArray(step.route)) {
            navigatePromise = this.router.navigate(step.route);
        }
        navigatePromise.then(function (navigated) {
            if (navigated !== false) {
                setTimeout(function () { return _this.setCurrentStep(step); });
            }
        });
    };
    /**
     * @private
     * @param {?} stepId
     * @return {?}
     */
    TourService.prototype.loadStep = /**
     * @private
     * @param {?} stepId
     * @return {?}
     */
    function (stepId) {
        if (typeof stepId === 'number') {
            return this.steps[stepId];
        }
        else {
            return this.steps.find(function (step) { return step.stepId === stepId; });
        }
    };
    /**
     * @private
     * @param {?} step
     * @return {?}
     */
    TourService.prototype.setCurrentStep = /**
     * @private
     * @param {?} step
     * @return {?}
     */
    function (step) {
        var _this = this;
        if (this.currentStep) {
            this.hideStep(this.currentStep);
        }
        this.currentStep = step;
        this.showStep(this.currentStep);
        this.router.events
            .pipe(filter(function (event) { return event instanceof NavigationStart; }), first())
            .subscribe(function (event) {
            if (_this.currentStep && _this.currentStep.hasOwnProperty('route')) {
                _this.hideStep(_this.currentStep);
            }
        });
    };
    /**
     * @private
     * @param {?} step
     * @return {?}
     */
    TourService.prototype.showStep = /**
     * @private
     * @param {?} step
     * @return {?}
     */
    function (step) {
        /** @type {?} */
        var anchor = this.anchors[step && step.anchorId];
        if (!anchor) {
            /** @type {?} */
            var stepIndex = this.steps.indexOf(step);
            this.skipStep();
        }
        else {
            anchor.showTourStep(step);
            this.stepShow$.next(step);
        }
    };
    /**
     * @protected
     * @param {?} step
     * @return {?}
     */
    TourService.prototype.hideStep = /**
     * @protected
     * @param {?} step
     * @return {?}
     */
    function (step) {
        /** @type {?} */
        var anchor = this.anchors[step && step.anchorId];
        if (!anchor) {
            return;
        }
        anchor.hideTourStep();
        this.stepHide$.next(step);
    };
    /**
     * @private
     * @return {?}
     */
    TourService.prototype.skipStep = /**
     * @private
     * @return {?}
     */
    function () {
        switch (this.direction) {
            case TourDirection.Next: {
                this.next();
                break;
            }
            case TourDirection.Previous: {
                this.prev();
                break;
            }
        }
    };
    TourService.decorators = [
        { type: Injectable }
    ];
    /** @nocollapse */
    TourService.ctorParameters = function () { return [
        { type: Router }
    ]; };
    return TourService;
}());
export { TourService };
if (false) {
    /** @type {?} */
    TourService.prototype.stepShow$;
    /** @type {?} */
    TourService.prototype.stepHide$;
    /** @type {?} */
    TourService.prototype.initialize$;
    /** @type {?} */
    TourService.prototype.start$;
    /** @type {?} */
    TourService.prototype.end$;
    /** @type {?} */
    TourService.prototype.pause$;
    /** @type {?} */
    TourService.prototype.resume$;
    /** @type {?} */
    TourService.prototype.anchorRegister$;
    /** @type {?} */
    TourService.prototype.anchorUnregister$;
    /** @type {?} */
    TourService.prototype.events$;
    /** @type {?} */
    TourService.prototype.steps;
    /** @type {?} */
    TourService.prototype.currentStep;
    /** @type {?} */
    TourService.prototype.anchors;
    /**
     * @type {?}
     * @private
     */
    TourService.prototype.status;
    /**
     * @type {?}
     * @private
     */
    TourService.prototype.isHotKeysEnabled;
    /**
     * @type {?}
     * @private
     */
    TourService.prototype.direction;
    /**
     * @type {?}
     * @private
     */
    TourService.prototype.router;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG91ci5zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6Im5nOi8vbmd4LXRvdXItY29yZS8iLCJzb3VyY2VzIjpbImxpYi90b3VyLnNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztBQUFBLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDM0MsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLEVBQWMsTUFBTSxpQkFBaUIsQ0FBQztBQUd0RSxPQUFPLEVBQUUsT0FBTyxFQUFjLEtBQUssSUFBSSxXQUFXLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFDakUsT0FBTyxFQUFFLEtBQUssRUFBRSxHQUFHLEVBQUUsTUFBTSxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7Ozs7QUFFcEQsaUNBYUM7OztJQVpDLDZCQUFnQjs7SUFDaEIsK0JBQWtCOztJQUNsQiw0QkFBZTs7SUFDZiw4QkFBaUI7O0lBQ2pCLDRCQUE4Qjs7SUFDOUIsK0JBQTJCOztJQUMzQiwrQkFBMkI7O0lBQzNCLGdDQUFnQjs7SUFDaEIsdUNBQTJCOztJQUMzQixtQ0FBc0I7O0lBQ3RCLG1DQUFzQjs7SUFDdEIsa0NBQXFCOzs7O0lBSXJCLE1BQUc7SUFDSCxLQUFFO0lBQ0YsU0FBTTs7Ozs7Ozs7SUFJTixPQUFRO0lBQ1IsT0FBUTtJQUNSLFdBQVk7Ozs7Ozs7OztBQUdkO0lBeUNFLHFCQUNVLE1BQWM7UUFBZCxXQUFNLEdBQU4sTUFBTSxDQUFRO1FBeENqQixjQUFTLEdBQWUsSUFBSSxPQUFPLEVBQUUsQ0FBQztRQUN0QyxjQUFTLEdBQWUsSUFBSSxPQUFPLEVBQUUsQ0FBQztRQUN0QyxnQkFBVyxHQUFpQixJQUFJLE9BQU8sRUFBRSxDQUFDO1FBQzFDLFdBQU0sR0FBZSxJQUFJLE9BQU8sRUFBRSxDQUFDO1FBQ25DLFNBQUksR0FBaUIsSUFBSSxPQUFPLEVBQUUsQ0FBQztRQUNuQyxXQUFNLEdBQWUsSUFBSSxPQUFPLEVBQUUsQ0FBQztRQUNuQyxZQUFPLEdBQWUsSUFBSSxP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QUFsQixVQUFtQixJQUFPOztZQUNsQixNQUFNLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQztRQUNsRCxJQUFJLENBQUMsTUFBTSxFQUFFO1lBQ1gsT0FBTztTQUNSO1FBQ0QsTUFBTSxDQUFDLFlBQVksRUFBRSxDQUFDO1FBQ3RCLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQzVCLENBQUM7Ozs7O0lBRU8sOEJBQVE7Ozs7SUFBaEI7UUFDRSxRQUFRLElBQUksQ0FBQyxTQUFTLEVBQUU7WUFDdEIsS0FBSyxhQUFhLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ3ZCLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztnQkFDWixNQUFNO2FBQ1A7WUFDRCxLQUFLLGFBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQztnQkFDM0IsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO2dCQUNaLE1BQU07YUFDUDtTQUNGO0lBQ0gsQ0FBQzs7Z0JBelFGLFVBQVU7Ozs7Z0JBakNlLE1BQU07O0lBMlNoQyxrQkFBQztDQUFBLEFBMVFELElBMFFDO1NBelFZLFdBQVc7OztJQUN0QixnQ0FBNkM7O0lBQzdDLGdDQUE2Qzs7SUFDN0Msa0NBQWlEOztJQUNqRCw2QkFBMEM7O0lBQzFDLDJCQUEwQzs7SUFDMUMsNkJBQTBDOztJQUMxQyw4QkFBMkM7O0lBQzNDLHNDQUF3RDs7SUFDeEQsd0NBQTBEOztJQUMxRCw4QkFvQkU7O0lBRUYsNEJBQXVCOztJQUN2QixrQ0FBc0I7O0lBRXRCLDhCQUFpRTs7Ozs7SUFDakUsNkJBQTBDOzs7OztJQUMxQyx1Q0FBZ0M7Ozs7O0lBQ2hDLGdDQUFzRDs7Ozs7SUFHcEQsNkJBQXNCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSW5qZWN0YWJsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xyXG5pbXBvcnQgeyBOYXZpZ2F0aW9uU3RhcnQsIFJvdXRlciwgVXJsU2VnbWVudCB9IGZyb20gJ0Bhbmd1bGFyL3JvdXRlcic7XHJcblxyXG5pbXBvcnQgeyBUb3VyQW5jaG9yRGlyZWN0aXZlIH0gZnJvbSAnLi90b3VyLWFuY2hvci5kaXJlY3RpdmUnO1xyXG5pbXBvcnQgeyBTdWJqZWN0LCBPYnNlcnZhYmxlLCBtZXJnZSBhcyBtZXJnZVN0YXRpYyB9IGZyb20gJ3J4anMnO1xyXG5pbXBvcnQgeyBmaXJzdCwgbWFwLCBmaWx0ZXIgfSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIElTdGVwT3B0aW9uIHtcclxuICBzdGVwSWQ/OiBzdHJpbmc7XHJcbiAgYW5jaG9ySWQ/OiBzdHJpbmc7XHJcbiAgdGl0bGU/OiBzdHJpbmc7XHJcbiAgY29udGVudD86IHN0cmluZztcclxuICByb3V0ZT86IHN0cmluZyB8IFVybFNlZ21lbnRbXTtcclxuICBuZXh0U3RlcD86IG51bWJlciB8IHN0cmluZztcclxuICBwcmV2U3RlcD86IG51bWJlciB8IHN0cmluZztcclxuICBwbGFjZW1lbnQ/OiBhbnk7XHJcbiAgcHJldmVudFNjcm9sbGluZz86IGJvb2xlYW47XHJcbiAgcHJldkJ0blRpdGxlPzogc3RyaW5nO1xyXG4gIG5leHRCdG5UaXRsZT86IHN0cmluZztcclxuICBlbmRCdG5UaXRsZT86IHN0cmluZztcclxufVxyXG5cclxuZXhwb3J0IGVudW0gVG91clN0YXRlIHtcclxuICBPRkYsXHJcbiAgT04sXHJcbiAgUEFVU0VEXHJcbn1cclxuXHJcbmV4cG9ydCBlbnVtIFRvdXJEaXJlY3Rpb24ge1xyXG4gIE5vbmUgPSAwLFxyXG4gIE5leHQgPSAxLFxyXG4gIFByZXZpb3VzID0gMlxyXG59XHJcblxyXG5ASW5qZWN0YWJsZSgpXHJcbmV4cG9ydCBjbGFzcyBUb3VyU2VydmljZTxUIGV4dGVuZHMgSVN0ZXBPcHRpb24gPSBJU3RlcE9wdGlvbj4ge1xyXG4gIHB1YmxpYyBzdGVwU2hvdyQ6IFN1YmplY3Q8VD4gPSBuZXcgU3ViamVjdCgpO1xyXG4gIHB1YmxpYyBzdGVwSGlkZSQ6IFN1YmplY3Q8VD4gPSBuZXcgU3ViamVjdCgpO1xyXG4gIHB1YmxpYyBpbml0aWFsaXplJDogU3ViamVjdDxUW10+ID0gbmV3IFN1YmplY3QoKTtcclxuICBwdWJsaWMgc3RhcnQkOiBTdWJqZWN0PFQ+ID0gbmV3IFN1YmplY3QoKTtcclxuICBwdWJsaWMgZW5kJDogU3ViamVjdDxhbnk+ID0gbmV3IFN1YmplY3QoKTtcclxuICBwdWJsaWMgcGF1c2UkOiBTdWJqZWN0PFQ+ID0gbmV3IFN1YmplY3QoKTtcclxuICBwdWJsaWMgcmVzdW1lJDogU3ViamVjdDxUPiA9IG5ldyBTdWJqZWN0KCk7XHJcbiAgcHVibGljIGFuY2hvclJlZ2lzdGVyJDogU3ViamVjdDxzdHJpbmc+ID0gbmV3IFN1YmplY3QoKTtcclxuICBwdWJsaWMgYW5jaG9yVW5yZWdpc3RlciQ6IFN1YmplY3Q8c3RyaW5nPiA9IG5ldyBTdWJqZWN0KCk7XHJcbiAgcHVibGljIGV2ZW50cyQ6IE9ic2VydmFibGU8eyBuYW1lOiBzdHJpbmc7IHZhbHVlOiBhbnkgfT4gPSBtZXJnZVN0YXRpYyhcclxuICAgIHRoaXMuc3RlcFNob3ckLnBpcGUobWFwKHZhbHVlID0+ICh7IG5hbWU6ICdzdGVwU2hvdycsIHZhbHVlIH0pKSksXHJcbiAgICB0aGlzLnN0ZXBIaWRlJC5waXBlKG1hcCh2YWx1ZSA9PiAoeyBuYW1lOiAnc3RlcEhpZGUnLCB2YWx1ZSB9KSkpLFxyXG4gICAgdGhpcy5pbml0aWFsaXplJC5waXBlKG1hcCh2YWx1ZSA9PiAoeyBuYW1lOiAnaW5pdGlhbGl6ZScsIHZhbHVlIH0pKSksXHJcbiAgICB0aGlzLnN0YXJ0JC5waXBlKG1hcCh2YWx1ZSA9PiAoeyBuYW1lOiAnc3RhcnQnLCB2YWx1ZSB9KSkpLFxyXG4gICAgdGhpcy5lbmQkLnBpcGUobWFwKHZhbHVlID0+ICh7IG5hbWU6ICdlbmQnLCB2YWx1ZSB9KSkpLFxyXG4gICAgdGhpcy5wYXVzZSQucGlwZShtYXAodmFsdWUgPT4gKHsgbmFtZTogJ3BhdXNlJywgdmFsdWUgfSkpKSxcclxuICAgIHRoaXMucmVzdW1lJC5waXBlKG1hcCh2YWx1ZSA9PiAoeyBuYW1lOiAncmVzdW1lJywgdmFsdWUgfSkpKSxcclxuICAgIHRoaXMuYW5jaG9yUmVnaXN0ZXIkLnBpcGUoXHJcbiAgICAgIG1hcCh2YWx1ZSA9PiAoe1xyXG4gICAgICAgIG5hbWU6ICdhbmNob3JSZWdpc3RlcicsXHJcbiAgICAgICAgdmFsdWVcclxuICAgICAgfSkpXHJcbiAgICApLFxyXG4gICAgdGhpcy5hbmNob3JVbnJlZ2lzdGVyJC5waXBlKFxyXG4gICAgICBtYXAodmFsdWUgPT4gKHtcclxuICAgICAgICBuYW1lOiAnYW5jaG9yVW5yZWdpc3RlcicsXHJcbiAgICAgICAgdmFsdWVcclxuICAgICAgfSkpXHJcbiAgICApXHJcbiAgKTtcclxuXHJcbiAgcHVibGljIHN0ZXBzOiBUW10gPSBbXTtcclxuICBwdWJsaWMgY3VycmVudFN0ZXA6IFQ7XHJcblxyXG4gIHB1YmxpYyBhbmNob3JzOiB7IFthbmNob3JJZDogc3RyaW5nXTogVG91ckFuY2hvckRpcmVjdGl2ZSB9ID0ge307XHJcbiAgcHJpdmF0ZSBzdGF0dXM6IFRvdXJTdGF0ZSA9IFRvdXJTdGF0ZS5PRkY7XHJcbiAgcHJpdmF0ZSBpc0hvdEtleXNFbmFibGVkID0gdHJ1ZTtcclxuICBwcml2YXRlIGRpcmVjdGlvbjogVG91ckRpcmVjdGlvbiA9IFRvdXJEaXJlY3Rpb24uTmV4dDtcclxuXHJcbiAgY29uc3RydWN0b3IoXHJcbiAgICBwcml2YXRlIHJvdXRlcjogUm91dGVyLFxyXG4gICkgeyB9XHJcblxyXG4gIHB1YmxpYyBpbml0aWFsaXplKHN0ZXBzOiBUW10sIHN0ZXBEZWZhdWx0cz86IFQpOiB2b2lkIHtcclxuICAgIGlmIChzdGVwcyAmJiBzdGVwcy5sZW5ndGggPiAwKSB7XHJcbiAgICAgIHRoaXMuc3RhdHVzID0gVG91clN0YXRlLk9GRjtcclxuICAgICAgdGhpcy5zdGVwcyA9IHN0ZXBzLm1hcChzdGVwID0+IE9iamVjdC5hc3NpZ24oe30sIHN0ZXBEZWZhdWx0cywgc3RlcCkpO1xyXG4gICAgICB0aGlzLmluaXRpYWxpemUkLm5leHQodGhpcy5zdGVwcyk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZGlzYWJsZUhvdGtleXMoKTogdm9pZCB7XHJcbiAgICB0aGlzLmlzSG90S2V5c0VuYWJsZWQgPSBmYWxzZTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBlbmFibGVIb3RrZXlzKCk6IHZvaWQge1xyXG4gICAgdGhpcy5pc0hvdEtleXNFbmFibGVkID0gdHJ1ZTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBzdGFydCgpOiB2b2lkIHtcclxuICAgIHRoaXMuc3RhcnRBdCgwKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBzdGFydEF0KHN0ZXBJZDogbnVtYmVyIHwgc3RyaW5nKTogdm9pZCB7XHJcbiAgICB0aGlzLnN0YXR1cyA9IFRvdXJTdGF0ZS5PTjtcclxuICAgIHRoaXMuZ29Ub1N0ZXAodGhpcy5sb2FkU3RlcChzdGVwSWQpKTtcclxuICAgIHRoaXMuc3RhcnQkLm5leHQoKTtcclxuICAgIHRoaXMucm91dGVyLmV2ZW50c1xyXG4gICAgICAucGlwZShmaWx0ZXIoZXZlbnQgPT4gZXZlbnQgaW5zdGFuY2VvZiBOYXZpZ2F0aW9uU3RhcnQpLCBmaXJzdCgpKVxyXG4gICAgICAuc3Vic2NyaWJlKCgpID0+IHtcclxuICAgICAgICBpZiAodGhpcy5jdXJyZW50U3RlcCAmJiB0aGlzLmN1cnJlbnRTdGVwLmhhc093blByb3BlcnR5KCdyb3V0ZScpKSB7XHJcbiAgICAgICAgICB0aGlzLmhpZGVTdGVwKHRoaXMuY3VycmVudFN0ZXApO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZW5kKCk6IHZvaWQge1xyXG4gICAgdGhpcy5zdGF0dXMgPSBUb3VyU3RhdGUuT0ZGO1xyXG4gICAgdGhpcy5oaWRlU3RlcCh0aGlzLmN1cnJlbnRTdGVwKTtcclxuICAgIHRoaXMuY3VycmVudFN0ZXAgPSB1bmRlZmluZWQ7XHJcbiAgICB0aGlzLmVuZCQubmV4dCgpO1xyXG4gICAgdGhpcy5kaXJlY3Rpb24gPSBUb3VyRGlyZWN0aW9uLk5leHQ7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgcGF1c2UoKTogdm9pZCB7XHJcbiAgICB0aGlzLnN0YXR1cyA9IFRvdXJTdGF0ZS5QQVVTRUQ7XHJcbiAgICB0aGlzLmhpZGVTdGVwKHRoaXMuY3VycmVudFN0ZXApO1xyXG4gICAgdGhpcy5wYXVzZSQubmV4dCgpO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHJlc3VtZSgpOiB2b2lkIHtcclxuICAgIHRoaXMuc3RhdHVzID0gVG91clN0YXRlLk9OO1xyXG4gICAgdGhpcy5zaG93U3RlcCh0aGlzLmN1cnJlbnRTdGVwKTtcclxuICAgIHRoaXMucmVzdW1lJC5uZXh0KCk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgdG9nZ2xlKHBhdXNlPzogYm9vbGVhbik6IHZvaWQge1xyXG4gICAgaWYgKHBhdXNlKSB7XHJcbiAgICAgIGlmICh0aGlzLmN1cnJlbnRTdGVwKSB7XHJcbiAgICAgICAgdGhpcy5wYXVzZSgpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRoaXMucmVzdW1lKCk7XHJcbiAgICAgIH1cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGlmICh0aGlzLmN1cnJlbnRTdGVwKSB7XHJcbiAgICAgICAgdGhpcy5lbmQoKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICB0aGlzLnN0YXJ0KCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIHB1YmxpYyBuZXh0KCk6IHZvaWQge1xyXG4gICAgdGhpcy5kaXJlY3Rpb24gPSBUb3VyRGlyZWN0aW9uLk5leHQ7XHJcbiAgICBpZiAodGhpcy5oYXNOZXh0KHRoaXMuY3VycmVudFN0ZXApKSB7XHJcbiAgICAgIHRoaXMuZ29Ub1N0ZXAoXHJcbiAgICAgICAgdGhpcy5sb2FkU3RlcChcclxuICAgICAgICAgIHRoaXMuY3VycmVudFN0ZXAubmV4dFN0ZXAgfHwgdGhpcy5zdGVwcy5pbmRleE9mKHRoaXMuY3VycmVudFN0ZXApICsgMVxyXG4gICAgICAgIClcclxuICAgICAgKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRoaXMuZW5kKCk7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHB1YmxpYyBoYXNOZXh0KHN0ZXA6IFQpOiBib29sZWFuIHtcclxuICAgIGlmICghc3RlcCkge1xyXG4gICAgICAvLyBjb25zb2xlLndhcm4oJ0NhblxcJ3QgZ2V0IG5leHQgc3RlcC4gTm8gY3VycmVudFN0ZXAuJyk7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICAgIHJldHVybiAoXHJcbiAgICAgIHN0ZXAubmV4dFN0ZXAgIT09IHVuZGVmaW5lZCB8fFxyXG4gICAgICB0aGlzLnN0ZXBzLmluZGV4T2Yoc3RlcCkgPCB0aGlzLnN0ZXBzLmxlbmd0aCAtIDFcclxuICAgICk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgcHJldigpOiB2b2lkIHtcclxuICAgIHRoaXMuZGlyZWN0aW9uID0gVG91ckRpcmVjdGlvbi5QcmV2aW91cztcclxuICAgIGlmICh0aGlzLmhhc1ByZXYodGhpcy5jdXJyZW50U3RlcCkpIHtcclxuICAgICAgdGhpcy5nb1RvU3RlcChcclxuICAgICAgICB0aGlzLmxvYWRTdGVwKFxyXG4gICAgICAgICAgdGhpcy5jdXJyZW50U3RlcC5wcmV2U3RlcCB8fCB0aGlzLnN0ZXBzLmluZGV4T2YodGhpcy5jdXJyZW50U3RlcCkgLSAxXHJcbiAgICAgICAgKVxyXG4gICAgICApO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhpcy5lbmQoKTtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHVibGljIGhhc1ByZXYoc3RlcDogVCk6IGJvb2xlYW4ge1xyXG4gICAgaWYgKCFzdGVwKSB7XHJcbiAgICAgIC8vIGNvbnNvbGUud2FybignQ2FuXFwndCBnZXQgcHJldmlvdXMgc3RlcC4gTm8gY3VycmVudFN0ZXAuJyk7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICAgIHJldHVybiBzdGVwLnByZXZTdGVwICE9PSB1bmRlZmluZWQgfHwgdGhpcy5zdGVwcy5pbmRleE9mKHN0ZXApID4gMDtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBnb3RvKHN0ZXBJZDogbnVtYmVyIHwgc3RyaW5nKTogdm9pZCB7XHJcbiAgICB0aGlzLmdvVG9TdGVwKHRoaXMubG9hZFN0ZXAoc3RlcElkKSk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgcmVnaXN0ZXIoYW5jaG9ySWQ6IHN0cmluZywgYW5jaG9yOiBUb3VyQW5jaG9yRGlyZWN0aXZlKTogdm9pZCB7XHJcbiAgICBpZiAoIWFuY2hvcklkKVxyXG4gICAgICByZXR1cm47XHJcbiAgICBpZiAodGhpcy5hbmNob3JzW2FuY2hvcklkXSkge1xyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ2FuY2hvcklkICcgKyBhbmNob3JJZCArICcgYWxyZWFkeSByZWdpc3RlcmVkIScpO1xyXG4gICAgfVxyXG4gICAgdGhpcy5hbmNob3JzW2FuY2hvcklkXSA9IGFuY2hvcjtcclxuICAgIHRoaXMuYW5jaG9yUmVnaXN0ZXIkLm5leHQoYW5jaG9ySWQpO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHVucmVnaXN0ZXIoYW5jaG9ySWQ6IHN0cmluZyk6IHZvaWQge1xyXG4gICAgaWYgKCFhbmNob3JJZClcclxuICAgICAgcmV0dXJuO1xyXG4gICAgZGVsZXRlIHRoaXMuYW5jaG9yc1thbmNob3JJZF07XHJcbiAgICB0aGlzLmFuY2hvclVucmVnaXN0ZXIkLm5leHQoYW5jaG9ySWQpO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGdldFN0YXR1cygpOiBUb3VyU3RhdGUge1xyXG4gICAgcmV0dXJuIHRoaXMuc3RhdHVzO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGlzSG90a2V5c0VuYWJsZWQoKTogYm9vbGVhbiB7XHJcbiAgICByZXR1cm4gdGhpcy5pc0hvdEtleXNFbmFibGVkO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBnb1RvU3RlcChzdGVwOiBUKTogdm9pZCB7XHJcbiAgICBpZiAoIXN0ZXApIHtcclxuICAgICAgLy8gY29uc29sZS53YXJuKCdDYW5cXCd0IGdvIHRvIG5vbi1leGlzdGVudCBzdGVwJyk7XHJcbiAgICAgIHRoaXMuZW5kKCk7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIGxldCBuYXZpZ2F0ZVByb21pc2U6IFByb21pc2U8Ym9vbGVhbj4gPSBuZXcgUHJvbWlzZShyZXNvbHZlID0+XHJcbiAgICAgIHJlc29sdmUodHJ1ZSlcclxuICAgICk7XHJcbiAgICBpZiAoc3RlcC5yb3V0ZSAhPT0gdW5kZWZpbmVkICYmIHR5cGVvZiBzdGVwLnJvdXRlID09PSAnc3RyaW5nJykge1xyXG4gICAgICBuYXZpZ2F0ZVByb21pc2UgPSB0aGlzLnJvdXRlci5uYXZpZ2F0ZUJ5VXJsKHN0ZXAucm91dGUpO1xyXG4gICAgfSBlbHNlIGlmIChzdGVwLnJvdXRlICYmIEFycmF5LmlzQXJyYXkoc3RlcC5yb3V0ZSkpIHtcclxuICAgICAgbmF2aWdhdGVQcm9taXNlID0gdGhpcy5yb3V0ZXIubmF2aWdhdGUoc3RlcC5yb3V0ZSk7XHJcbiAgICB9XHJcbiAgICBuYXZpZ2F0ZVByb21pc2UudGhlbihuYXZpZ2F0ZWQgPT4ge1xyXG4gICAgICBpZiAobmF2aWdhdGVkICE9PSBmYWxzZSkge1xyXG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4gdGhpcy5zZXRDdXJyZW50U3RlcChzdGVwKSk7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBsb2FkU3RlcChzdGVwSWQ6IG51bWJlciB8IHN0cmluZyk6IFQge1xyXG4gICAgaWYgKHR5cGVvZiBzdGVwSWQgPT09ICdudW1iZXInKSB7XHJcbiAgICAgIHJldHVybiB0aGlzLnN0ZXBzW3N0ZXBJZF07XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICByZXR1cm4gdGhpcy5zdGVwcy5maW5kKHN0ZXAgPT4gc3RlcC5zdGVwSWQgPT09IHN0ZXBJZCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHNldEN1cnJlbnRTdGVwKHN0ZXA6IFQpOiB2b2lkIHtcclxuICAgIGlmICh0aGlzLmN1cnJlbnRTdGVwKSB7XHJcbiAgICAgIHRoaXMuaGlkZVN0ZXAodGhpcy5jdXJyZW50U3RlcCk7XHJcbiAgICB9XHJcbiAgICB0aGlzLmN1cnJlbnRTdGVwID0gc3RlcDtcclxuICAgIHRoaXMuc2hvd1N0ZXAodGhpcy5jdXJyZW50U3RlcCk7XHJcbiAgICB0aGlzLnJvdXRlci5ldmVudHNcclxuICAgICAgLnBpcGUoZmlsdGVyKGV2ZW50ID0+IGV2ZW50IGluc3RhbmNlb2YgTmF2aWdhdGlvblN0YXJ0KSwgZmlyc3QoKSlcclxuICAgICAgLnN1YnNjcmliZSgoZXZlbnQpID0+IHtcclxuICAgICAgICBpZiAodGhpcy5jdXJyZW50U3RlcCAmJiB0aGlzLmN1cnJlbnRTdGVwLmhhc093blByb3BlcnR5KCdyb3V0ZScpKSB7XHJcbiAgICAgICAgICB0aGlzLmhpZGVTdGVwKHRoaXMuY3VycmVudFN0ZXApO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHNob3dTdGVwKHN0ZXA6IFQpOiB2b2lkIHtcclxuICAgIGNvbnN0IGFuY2hvciA9IHRoaXMuYW5jaG9yc1tzdGVwICYmIHN0ZXAuYW5jaG9ySWRdO1xyXG4gICAgaWYgKCFhbmNob3IpIHtcclxuICAgICAgbGV0IHN0ZXBJbmRleCA9IHRoaXMuc3RlcHMuaW5kZXhPZihzdGVwKTtcclxuICAgICAgdGhpcy5za2lwU3RlcCgpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgYW5jaG9yLnNob3dUb3VyU3RlcChzdGVwKTtcclxuICAgICAgdGhpcy5zdGVwU2hvdyQubmV4dChzdGVwKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHByb3RlY3RlZCBoaWRlU3RlcChzdGVwOiBUKTogdm9pZCB7XHJcbiAgICBjb25zdCBhbmNob3IgPSB0aGlzLmFuY2hvcnNbc3RlcCAmJiBzdGVwLmFuY2hvcklkXTtcclxuICAgIGlmICghYW5jaG9yKSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIGFuY2hvci5oaWRlVG91clN0ZXAoKTtcclxuICAgIHRoaXMuc3RlcEhpZGUkLm5leHQoc3RlcCk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHNraXBTdGVwKCkge1xyXG4gICAgc3dpdGNoICh0aGlzLmRpcmVjdGlvbikge1xyXG4gICAgICBjYXNlIFRvdXJEaXJlY3Rpb24uTmV4dDoge1xyXG4gICAgICAgIHRoaXMubmV4dCgpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICB9XHJcbiAgICAgIGNhc2UgVG91ckRpcmVjdGlvbi5QcmV2aW91czoge1xyXG4gICAgICAgIHRoaXMucHJldigpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcbiJdfQ==