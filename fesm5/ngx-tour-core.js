import { Injectable, Component, HostListener, NgModule } from '@angular/core';
import { NavigationStart, Router, RouterModule } from '@angular/router';
import { Subject, merge } from 'rxjs';
import { first, map, filter } from 'rxjs/operators';
import { CommonModule } from '@angular/common';

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
/** @enum {number} */
var TourState = {
    OFF: 0,
    ON: 1,
    PAUSED: 2,
};
TourState[TourState.OFF] = 'OFF';
TourState[TourState.ON] = 'ON';
TourState[TourState.PAUSED] = 'PAUSED';
/** @enum {number} */
var TourDirection = {
    None: 0,
    Next: 1,
    Previous: 2,
};
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
        this.events$ = merge(this.stepShow$.pipe(map(function (value) { return ({ name: 'stepShow', value: value }); })), this.stepHide$.pipe(map(function (value) { return ({ name: 'stepHide', value: value }); })), this.initialize$.pipe(map(function (value) { return ({ name: 'initialize', value: value }); })), this.start$.pipe(map(function (value) { return ({ name: 'start', value: value }); })), this.end$.pipe(map(function (value) { return ({ name: 'end', value: value }); })), this.pause$.pipe(map(function (value) { return ({ name: 'pause', value: value }); })), this.resume$.pipe(map(function (value) { return ({ name: 'resume', value: value }); })), this.anchorRegister$.pipe(map(function (value) { return ({
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

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
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

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
var TourModule = /** @class */ (function () {
    function TourModule() {
    }
    /**
     * @return {?}
     */
    TourModule.forRoot = /**
     * @return {?}
     */
    function () {
        return {
            ngModule: TourModule,
            providers: [
                TourService,
            ],
        };
    };
    TourModule.decorators = [
        { type: NgModule, args: [{
                    declarations: [TourHotkeyListenerComponent],
                    exports: [TourHotkeyListenerComponent],
                    imports: [CommonModule, RouterModule],
                },] }
    ];
    return TourModule;
}());

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */

export { TourModule, TourService, TourState, TourHotkeyListenerComponent };

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmd4LXRvdXItY29yZS5qcy5tYXAiLCJzb3VyY2VzIjpbIm5nOi8vbmd4LXRvdXItY29yZS9saWIvdG91ci5zZXJ2aWNlLnRzIiwibmc6Ly9uZ3gtdG91ci1jb3JlL2xpYi90b3VyLWhvdGtleS1saXN0ZW5lci5jb21wb25lbnQudHMiLCJuZzovL25neC10b3VyLWNvcmUvbGliL3RvdXIubW9kdWxlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEluamVjdGFibGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcclxuaW1wb3J0IHsgTmF2aWdhdGlvblN0YXJ0LCBSb3V0ZXIsIFVybFNlZ21lbnQgfSBmcm9tICdAYW5ndWxhci9yb3V0ZXInO1xyXG5cclxuaW1wb3J0IHsgVG91ckFuY2hvckRpcmVjdGl2ZSB9IGZyb20gJy4vdG91ci1hbmNob3IuZGlyZWN0aXZlJztcclxuaW1wb3J0IHsgU3ViamVjdCwgT2JzZXJ2YWJsZSwgbWVyZ2UgYXMgbWVyZ2VTdGF0aWMgfSBmcm9tICdyeGpzJztcclxuaW1wb3J0IHsgZmlyc3QsIG1hcCwgZmlsdGVyIH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xyXG5cclxuZXhwb3J0IGludGVyZmFjZSBJU3RlcE9wdGlvbiB7XHJcbiAgc3RlcElkPzogc3RyaW5nO1xyXG4gIGFuY2hvcklkPzogc3RyaW5nO1xyXG4gIHRpdGxlPzogc3RyaW5nO1xyXG4gIGNvbnRlbnQ/OiBzdHJpbmc7XHJcbiAgcm91dGU/OiBzdHJpbmcgfCBVcmxTZWdtZW50W107XHJcbiAgbmV4dFN0ZXA/OiBudW1iZXIgfCBzdHJpbmc7XHJcbiAgcHJldlN0ZXA/OiBudW1iZXIgfCBzdHJpbmc7XHJcbiAgcGxhY2VtZW50PzogYW55O1xyXG4gIHByZXZlbnRTY3JvbGxpbmc/OiBib29sZWFuO1xyXG4gIHByZXZCdG5UaXRsZT86IHN0cmluZztcclxuICBuZXh0QnRuVGl0bGU/OiBzdHJpbmc7XHJcbiAgZW5kQnRuVGl0bGU/OiBzdHJpbmc7XHJcbn1cclxuXHJcbmV4cG9ydCBlbnVtIFRvdXJTdGF0ZSB7XHJcbiAgT0ZGLFxyXG4gIE9OLFxyXG4gIFBBVVNFRFxyXG59XHJcblxyXG5leHBvcnQgZW51bSBUb3VyRGlyZWN0aW9uIHtcclxuICBOb25lID0gMCxcclxuICBOZXh0ID0gMSxcclxuICBQcmV2aW91cyA9IDJcclxufVxyXG5cclxuQEluamVjdGFibGUoKVxyXG5leHBvcnQgY2xhc3MgVG91clNlcnZpY2U8VCBleHRlbmRzIElTdGVwT3B0aW9uID0gSVN0ZXBPcHRpb24+IHtcclxuICBwdWJsaWMgc3RlcFNob3ckOiBTdWJqZWN0PFQ+ID0gbmV3IFN1YmplY3QoKTtcclxuICBwdWJsaWMgc3RlcEhpZGUkOiBTdWJqZWN0PFQ+ID0gbmV3IFN1YmplY3QoKTtcclxuICBwdWJsaWMgaW5pdGlhbGl6ZSQ6IFN1YmplY3Q8VFtdPiA9IG5ldyBTdWJqZWN0KCk7XHJcbiAgcHVibGljIHN0YXJ0JDogU3ViamVjdDxUPiA9IG5ldyBTdWJqZWN0KCk7XHJcbiAgcHVibGljIGVuZCQ6IFN1YmplY3Q8YW55PiA9IG5ldyBTdWJqZWN0KCk7XHJcbiAgcHVibGljIHBhdXNlJDogU3ViamVjdDxUPiA9IG5ldyBTdWJqZWN0KCk7XHJcbiAgcHVibGljIHJlc3VtZSQ6IFN1YmplY3Q8VD4gPSBuZXcgU3ViamVjdCgpO1xyXG4gIHB1YmxpYyBhbmNob3JSZWdpc3RlciQ6IFN1YmplY3Q8c3RyaW5nPiA9IG5ldyBTdWJqZWN0KCk7XHJcbiAgcHVibGljIGFuY2hvclVucmVnaXN0ZXIkOiBTdWJqZWN0PHN0cmluZz4gPSBuZXcgU3ViamVjdCgpO1xyXG4gIHB1YmxpYyBldmVudHMkOiBPYnNlcnZhYmxlPHsgbmFtZTogc3RyaW5nOyB2YWx1ZTogYW55IH0+ID0gbWVyZ2VTdGF0aWMoXHJcbiAgICB0aGlzLnN0ZXBTaG93JC5waXBlKG1hcCh2YWx1ZSA9PiAoeyBuYW1lOiAnc3RlcFNob3cnLCB2YWx1ZSB9KSkpLFxyXG4gICAgdGhpcy5zdGVwSGlkZSQucGlwZShtYXAodmFsdWUgPT4gKHsgbmFtZTogJ3N0ZXBIaWRlJywgdmFsdWUgfSkpKSxcclxuICAgIHRoaXMuaW5pdGlhbGl6ZSQucGlwZShtYXAodmFsdWUgPT4gKHsgbmFtZTogJ2luaXRpYWxpemUnLCB2YWx1ZSB9KSkpLFxyXG4gICAgdGhpcy5zdGFydCQucGlwZShtYXAodmFsdWUgPT4gKHsgbmFtZTogJ3N0YXJ0JywgdmFsdWUgfSkpKSxcclxuICAgIHRoaXMuZW5kJC5waXBlKG1hcCh2YWx1ZSA9PiAoeyBuYW1lOiAnZW5kJywgdmFsdWUgfSkpKSxcclxuICAgIHRoaXMucGF1c2UkLnBpcGUobWFwKHZhbHVlID0+ICh7IG5hbWU6ICdwYXVzZScsIHZhbHVlIH0pKSksXHJcbiAgICB0aGlzLnJlc3VtZSQucGlwZShtYXAodmFsdWUgPT4gKHsgbmFtZTogJ3Jlc3VtZScsIHZhbHVlIH0pKSksXHJcbiAgICB0aGlzLmFuY2hvclJlZ2lzdGVyJC5waXBlKFxyXG4gICAgICBtYXAodmFsdWUgPT4gKHtcclxuICAgICAgICBuYW1lOiAnYW5jaG9yUmVnaXN0ZXInLFxyXG4gICAgICAgIHZhbHVlXHJcbiAgICAgIH0pKVxyXG4gICAgKSxcclxuICAgIHRoaXMuYW5jaG9yVW5yZWdpc3RlciQucGlwZShcclxuICAgICAgbWFwKHZhbHVlID0+ICh7XHJcbiAgICAgICAgbmFtZTogJ2FuY2hvclVucmVnaXN0ZXInLFxyXG4gICAgICAgIHZhbHVlXHJcbiAgICAgIH0pKVxyXG4gICAgKVxyXG4gICk7XHJcblxyXG4gIHB1YmxpYyBzdGVwczogVFtdID0gW107XHJcbiAgcHVibGljIGN1cnJlbnRTdGVwOiBUO1xyXG5cclxuICBwdWJsaWMgYW5jaG9yczogeyBbYW5jaG9ySWQ6IHN0cmluZ106IFRvdXJBbmNob3JEaXJlY3RpdmUgfSA9IHt9O1xyXG4gIHByaXZhdGUgc3RhdHVzOiBUb3VyU3RhdGUgPSBUb3VyU3RhdGUuT0ZGO1xyXG4gIHByaXZhdGUgaXNIb3RLZXlzRW5hYmxlZCA9IHRydWU7XHJcbiAgcHJpdmF0ZSBkaXJlY3Rpb246IFRvdXJEaXJlY3Rpb24gPSBUb3VyRGlyZWN0aW9uLk5leHQ7XHJcblxyXG4gIGNvbnN0cnVjdG9yKFxyXG4gICAgcHJpdmF0ZSByb3V0ZXI6IFJvdXRlcixcclxuICApIHsgfVxyXG5cclxuICBwdWJsaWMgaW5pdGlhbGl6ZShzdGVwczogVFtdLCBzdGVwRGVmYXVsdHM/OiBUKTogdm9pZCB7XHJcbiAgICBpZiAoc3RlcHMgJiYgc3RlcHMubGVuZ3RoID4gMCkge1xyXG4gICAgICB0aGlzLnN0YXR1cyA9IFRvdXJTdGF0ZS5PRkY7XHJcbiAgICAgIHRoaXMuc3RlcHMgPSBzdGVwcy5tYXAoc3RlcCA9PiBPYmplY3QuYXNzaWduKHt9LCBzdGVwRGVmYXVsdHMsIHN0ZXApKTtcclxuICAgICAgdGhpcy5pbml0aWFsaXplJC5uZXh0KHRoaXMuc3RlcHMpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHVibGljIGRpc2FibGVIb3RrZXlzKCk6IHZvaWQge1xyXG4gICAgdGhpcy5pc0hvdEtleXNFbmFibGVkID0gZmFsc2U7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZW5hYmxlSG90a2V5cygpOiB2b2lkIHtcclxuICAgIHRoaXMuaXNIb3RLZXlzRW5hYmxlZCA9IHRydWU7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgc3RhcnQoKTogdm9pZCB7XHJcbiAgICB0aGlzLnN0YXJ0QXQoMCk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgc3RhcnRBdChzdGVwSWQ6IG51bWJlciB8IHN0cmluZyk6IHZvaWQge1xyXG4gICAgdGhpcy5zdGF0dXMgPSBUb3VyU3RhdGUuT047XHJcbiAgICB0aGlzLmdvVG9TdGVwKHRoaXMubG9hZFN0ZXAoc3RlcElkKSk7XHJcbiAgICB0aGlzLnN0YXJ0JC5uZXh0KCk7XHJcbiAgICB0aGlzLnJvdXRlci5ldmVudHNcclxuICAgICAgLnBpcGUoZmlsdGVyKGV2ZW50ID0+IGV2ZW50IGluc3RhbmNlb2YgTmF2aWdhdGlvblN0YXJ0KSwgZmlyc3QoKSlcclxuICAgICAgLnN1YnNjcmliZSgoKSA9PiB7XHJcbiAgICAgICAgaWYgKHRoaXMuY3VycmVudFN0ZXAgJiYgdGhpcy5jdXJyZW50U3RlcC5oYXNPd25Qcm9wZXJ0eSgncm91dGUnKSkge1xyXG4gICAgICAgICAgdGhpcy5oaWRlU3RlcCh0aGlzLmN1cnJlbnRTdGVwKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGVuZCgpOiB2b2lkIHtcclxuICAgIHRoaXMuc3RhdHVzID0gVG91clN0YXRlLk9GRjtcclxuICAgIHRoaXMuaGlkZVN0ZXAodGhpcy5jdXJyZW50U3RlcCk7XHJcbiAgICB0aGlzLmN1cnJlbnRTdGVwID0gdW5kZWZpbmVkO1xyXG4gICAgdGhpcy5lbmQkLm5leHQoKTtcclxuICAgIHRoaXMuZGlyZWN0aW9uID0gVG91ckRpcmVjdGlvbi5OZXh0O1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHBhdXNlKCk6IHZvaWQge1xyXG4gICAgdGhpcy5zdGF0dXMgPSBUb3VyU3RhdGUuUEFVU0VEO1xyXG4gICAgdGhpcy5oaWRlU3RlcCh0aGlzLmN1cnJlbnRTdGVwKTtcclxuICAgIHRoaXMucGF1c2UkLm5leHQoKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyByZXN1bWUoKTogdm9pZCB7XHJcbiAgICB0aGlzLnN0YXR1cyA9IFRvdXJTdGF0ZS5PTjtcclxuICAgIHRoaXMuc2hvd1N0ZXAodGhpcy5jdXJyZW50U3RlcCk7XHJcbiAgICB0aGlzLnJlc3VtZSQubmV4dCgpO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHRvZ2dsZShwYXVzZT86IGJvb2xlYW4pOiB2b2lkIHtcclxuICAgIGlmIChwYXVzZSkge1xyXG4gICAgICBpZiAodGhpcy5jdXJyZW50U3RlcCkge1xyXG4gICAgICAgIHRoaXMucGF1c2UoKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICB0aGlzLnJlc3VtZSgpO1xyXG4gICAgICB9XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBpZiAodGhpcy5jdXJyZW50U3RlcCkge1xyXG4gICAgICAgIHRoaXMuZW5kKCk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdGhpcy5zdGFydCgpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgbmV4dCgpOiB2b2lkIHtcclxuICAgIHRoaXMuZGlyZWN0aW9uID0gVG91ckRpcmVjdGlvbi5OZXh0O1xyXG4gICAgaWYgKHRoaXMuaGFzTmV4dCh0aGlzLmN1cnJlbnRTdGVwKSkge1xyXG4gICAgICB0aGlzLmdvVG9TdGVwKFxyXG4gICAgICAgIHRoaXMubG9hZFN0ZXAoXHJcbiAgICAgICAgICB0aGlzLmN1cnJlbnRTdGVwLm5leHRTdGVwIHx8IHRoaXMuc3RlcHMuaW5kZXhPZih0aGlzLmN1cnJlbnRTdGVwKSArIDFcclxuICAgICAgICApXHJcbiAgICAgICk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB0aGlzLmVuZCgpO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgaGFzTmV4dChzdGVwOiBUKTogYm9vbGVhbiB7XHJcbiAgICBpZiAoIXN0ZXApIHtcclxuICAgICAgLy8gY29uc29sZS53YXJuKCdDYW5cXCd0IGdldCBuZXh0IHN0ZXAuIE5vIGN1cnJlbnRTdGVwLicpO1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gKFxyXG4gICAgICBzdGVwLm5leHRTdGVwICE9PSB1bmRlZmluZWQgfHxcclxuICAgICAgdGhpcy5zdGVwcy5pbmRleE9mKHN0ZXApIDwgdGhpcy5zdGVwcy5sZW5ndGggLSAxXHJcbiAgICApO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHByZXYoKTogdm9pZCB7XHJcbiAgICB0aGlzLmRpcmVjdGlvbiA9IFRvdXJEaXJlY3Rpb24uUHJldmlvdXM7XHJcbiAgICBpZiAodGhpcy5oYXNQcmV2KHRoaXMuY3VycmVudFN0ZXApKSB7XHJcbiAgICAgIHRoaXMuZ29Ub1N0ZXAoXHJcbiAgICAgICAgdGhpcy5sb2FkU3RlcChcclxuICAgICAgICAgIHRoaXMuY3VycmVudFN0ZXAucHJldlN0ZXAgfHwgdGhpcy5zdGVwcy5pbmRleE9mKHRoaXMuY3VycmVudFN0ZXApIC0gMVxyXG4gICAgICAgIClcclxuICAgICAgKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRoaXMuZW5kKCk7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHB1YmxpYyBoYXNQcmV2KHN0ZXA6IFQpOiBib29sZWFuIHtcclxuICAgIGlmICghc3RlcCkge1xyXG4gICAgICAvLyBjb25zb2xlLndhcm4oJ0NhblxcJ3QgZ2V0IHByZXZpb3VzIHN0ZXAuIE5vIGN1cnJlbnRTdGVwLicpO1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gc3RlcC5wcmV2U3RlcCAhPT0gdW5kZWZpbmVkIHx8IHRoaXMuc3RlcHMuaW5kZXhPZihzdGVwKSA+IDA7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZ290byhzdGVwSWQ6IG51bWJlciB8IHN0cmluZyk6IHZvaWQge1xyXG4gICAgdGhpcy5nb1RvU3RlcCh0aGlzLmxvYWRTdGVwKHN0ZXBJZCkpO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHJlZ2lzdGVyKGFuY2hvcklkOiBzdHJpbmcsIGFuY2hvcjogVG91ckFuY2hvckRpcmVjdGl2ZSk6IHZvaWQge1xyXG4gICAgaWYgKCFhbmNob3JJZClcclxuICAgICAgcmV0dXJuO1xyXG4gICAgaWYgKHRoaXMuYW5jaG9yc1thbmNob3JJZF0pIHtcclxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdhbmNob3JJZCAnICsgYW5jaG9ySWQgKyAnIGFscmVhZHkgcmVnaXN0ZXJlZCEnKTtcclxuICAgIH1cclxuICAgIHRoaXMuYW5jaG9yc1thbmNob3JJZF0gPSBhbmNob3I7XHJcbiAgICB0aGlzLmFuY2hvclJlZ2lzdGVyJC5uZXh0KGFuY2hvcklkKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyB1bnJlZ2lzdGVyKGFuY2hvcklkOiBzdHJpbmcpOiB2b2lkIHtcclxuICAgIGlmICghYW5jaG9ySWQpXHJcbiAgICAgIHJldHVybjtcclxuICAgIGRlbGV0ZSB0aGlzLmFuY2hvcnNbYW5jaG9ySWRdO1xyXG4gICAgdGhpcy5hbmNob3JVbnJlZ2lzdGVyJC5uZXh0KGFuY2hvcklkKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBnZXRTdGF0dXMoKTogVG91clN0YXRlIHtcclxuICAgIHJldHVybiB0aGlzLnN0YXR1cztcclxuICB9XHJcblxyXG4gIHB1YmxpYyBpc0hvdGtleXNFbmFibGVkKCk6IGJvb2xlYW4ge1xyXG4gICAgcmV0dXJuIHRoaXMuaXNIb3RLZXlzRW5hYmxlZDtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgZ29Ub1N0ZXAoc3RlcDogVCk6IHZvaWQge1xyXG4gICAgaWYgKCFzdGVwKSB7XHJcbiAgICAgIC8vIGNvbnNvbGUud2FybignQ2FuXFwndCBnbyB0byBub24tZXhpc3RlbnQgc3RlcCcpO1xyXG4gICAgICB0aGlzLmVuZCgpO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICBsZXQgbmF2aWdhdGVQcm9taXNlOiBQcm9taXNlPGJvb2xlYW4+ID0gbmV3IFByb21pc2UocmVzb2x2ZSA9PlxyXG4gICAgICByZXNvbHZlKHRydWUpXHJcbiAgICApO1xyXG4gICAgaWYgKHN0ZXAucm91dGUgIT09IHVuZGVmaW5lZCAmJiB0eXBlb2Ygc3RlcC5yb3V0ZSA9PT0gJ3N0cmluZycpIHtcclxuICAgICAgbmF2aWdhdGVQcm9taXNlID0gdGhpcy5yb3V0ZXIubmF2aWdhdGVCeVVybChzdGVwLnJvdXRlKTtcclxuICAgIH0gZWxzZSBpZiAoc3RlcC5yb3V0ZSAmJiBBcnJheS5pc0FycmF5KHN0ZXAucm91dGUpKSB7XHJcbiAgICAgIG5hdmlnYXRlUHJvbWlzZSA9IHRoaXMucm91dGVyLm5hdmlnYXRlKHN0ZXAucm91dGUpO1xyXG4gICAgfVxyXG4gICAgbmF2aWdhdGVQcm9taXNlLnRoZW4obmF2aWdhdGVkID0+IHtcclxuICAgICAgaWYgKG5hdmlnYXRlZCAhPT0gZmFsc2UpIHtcclxuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHRoaXMuc2V0Q3VycmVudFN0ZXAoc3RlcCkpO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgbG9hZFN0ZXAoc3RlcElkOiBudW1iZXIgfCBzdHJpbmcpOiBUIHtcclxuICAgIGlmICh0eXBlb2Ygc3RlcElkID09PSAnbnVtYmVyJykge1xyXG4gICAgICByZXR1cm4gdGhpcy5zdGVwc1tzdGVwSWRdO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgcmV0dXJuIHRoaXMuc3RlcHMuZmluZChzdGVwID0+IHN0ZXAuc3RlcElkID09PSBzdGVwSWQpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBzZXRDdXJyZW50U3RlcChzdGVwOiBUKTogdm9pZCB7XHJcbiAgICBpZiAodGhpcy5jdXJyZW50U3RlcCkge1xyXG4gICAgICB0aGlzLmhpZGVTdGVwKHRoaXMuY3VycmVudFN0ZXApO1xyXG4gICAgfVxyXG4gICAgdGhpcy5jdXJyZW50U3RlcCA9IHN0ZXA7XHJcbiAgICB0aGlzLnNob3dTdGVwKHRoaXMuY3VycmVudFN0ZXApO1xyXG4gICAgdGhpcy5yb3V0ZXIuZXZlbnRzXHJcbiAgICAgIC5waXBlKGZpbHRlcihldmVudCA9PiBldmVudCBpbnN0YW5jZW9mIE5hdmlnYXRpb25TdGFydCksIGZpcnN0KCkpXHJcbiAgICAgIC5zdWJzY3JpYmUoKGV2ZW50KSA9PiB7XHJcbiAgICAgICAgaWYgKHRoaXMuY3VycmVudFN0ZXAgJiYgdGhpcy5jdXJyZW50U3RlcC5oYXNPd25Qcm9wZXJ0eSgncm91dGUnKSkge1xyXG4gICAgICAgICAgdGhpcy5oaWRlU3RlcCh0aGlzLmN1cnJlbnRTdGVwKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBzaG93U3RlcChzdGVwOiBUKTogdm9pZCB7XHJcbiAgICBjb25zdCBhbmNob3IgPSB0aGlzLmFuY2hvcnNbc3RlcCAmJiBzdGVwLmFuY2hvcklkXTtcclxuICAgIGlmICghYW5jaG9yKSB7XHJcbiAgICAgIGxldCBzdGVwSW5kZXggPSB0aGlzLnN0ZXBzLmluZGV4T2Yoc3RlcCk7XHJcbiAgICAgIHRoaXMuc2tpcFN0ZXAoKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGFuY2hvci5zaG93VG91clN0ZXAoc3RlcCk7XHJcbiAgICAgIHRoaXMuc3RlcFNob3ckLm5leHQoc3RlcCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwcm90ZWN0ZWQgaGlkZVN0ZXAoc3RlcDogVCk6IHZvaWQge1xyXG4gICAgY29uc3QgYW5jaG9yID0gdGhpcy5hbmNob3JzW3N0ZXAgJiYgc3RlcC5hbmNob3JJZF07XHJcbiAgICBpZiAoIWFuY2hvcikge1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICBhbmNob3IuaGlkZVRvdXJTdGVwKCk7XHJcbiAgICB0aGlzLnN0ZXBIaWRlJC5uZXh0KHN0ZXApO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBza2lwU3RlcCgpIHtcclxuICAgIHN3aXRjaCAodGhpcy5kaXJlY3Rpb24pIHtcclxuICAgICAgY2FzZSBUb3VyRGlyZWN0aW9uLk5leHQ6IHtcclxuICAgICAgICB0aGlzLm5leHQoKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgfVxyXG4gICAgICBjYXNlIFRvdXJEaXJlY3Rpb24uUHJldmlvdXM6IHtcclxuICAgICAgICB0aGlzLnByZXYoKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxufVxyXG4iLCJpbXBvcnQgeyBDb21wb25lbnQsIEhvc3RMaXN0ZW5lciB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xyXG5cclxuaW1wb3J0IHsgVG91clNlcnZpY2UsIFRvdXJTdGF0ZSB9IGZyb20gJy4vdG91ci5zZXJ2aWNlJztcclxuXHJcbkBDb21wb25lbnQoe1xyXG4gIHNlbGVjdG9yOiAndG91ci1ob3RrZXktbGlzdGVuZXInLFxyXG4gIHRlbXBsYXRlOiBgPG5nLWNvbnRlbnQ+PC9uZy1jb250ZW50PmBcclxufSlcclxuZXhwb3J0IGNsYXNzIFRvdXJIb3RrZXlMaXN0ZW5lckNvbXBvbmVudCB7XHJcbiAgY29uc3RydWN0b3IocHVibGljIHRvdXJTZXJ2aWNlOiBUb3VyU2VydmljZSkge31cclxuXHJcbiAgLyoqXHJcbiAgICogQ29uZmlndXJlcyBob3Qga2V5cyBmb3IgY29udHJvbGxpbmcgdGhlIHRvdXIgd2l0aCB0aGUga2V5Ym9hcmRcclxuICAgKi9cclxuICBASG9zdExpc3RlbmVyKCd3aW5kb3c6a2V5ZG93bi5Fc2NhcGUnKVxyXG4gIHB1YmxpYyBvbkVzY2FwZUtleSgpOiB2b2lkIHtcclxuICAgIGlmIChcclxuICAgICAgdGhpcy50b3VyU2VydmljZS5nZXRTdGF0dXMoKSA9PT0gVG91clN0YXRlLk9OICYmXHJcbiAgICAgIHRoaXMudG91clNlcnZpY2UuaXNIb3RrZXlzRW5hYmxlZCgpXHJcbiAgICApIHtcclxuICAgICAgdGhpcy50b3VyU2VydmljZS5lbmQoKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIEBIb3N0TGlzdGVuZXIoJ3dpbmRvdzprZXlkb3duLkFycm93UmlnaHQnKVxyXG4gIHB1YmxpYyBvbkFycm93UmlnaHRLZXkoKTogdm9pZCB7XHJcbiAgICBpZiAoXHJcbiAgICAgIHRoaXMudG91clNlcnZpY2UuZ2V0U3RhdHVzKCkgPT09IFRvdXJTdGF0ZS5PTiAmJlxyXG4gICAgICB0aGlzLnRvdXJTZXJ2aWNlLmhhc05leHQodGhpcy50b3VyU2VydmljZS5jdXJyZW50U3RlcCkgJiZcclxuICAgICAgdGhpcy50b3VyU2VydmljZS5pc0hvdGtleXNFbmFibGVkKClcclxuICAgICkge1xyXG4gICAgICB0aGlzLnRvdXJTZXJ2aWNlLm5leHQoKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIEBIb3N0TGlzdGVuZXIoJ3dpbmRvdzprZXlkb3duLkFycm93TGVmdCcpXHJcbiAgcHVibGljIG9uQXJyb3dMZWZ0S2V5KCk6IHZvaWQge1xyXG4gICAgaWYgKFxyXG4gICAgICB0aGlzLnRvdXJTZXJ2aWNlLmdldFN0YXR1cygpID09PSBUb3VyU3RhdGUuT04gJiZcclxuICAgICAgdGhpcy50b3VyU2VydmljZS5oYXNQcmV2KHRoaXMudG91clNlcnZpY2UuY3VycmVudFN0ZXApICYmXHJcbiAgICAgIHRoaXMudG91clNlcnZpY2UuaXNIb3RrZXlzRW5hYmxlZCgpXHJcbiAgICApIHtcclxuICAgICAgdGhpcy50b3VyU2VydmljZS5wcmV2KCk7XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcbiIsImltcG9ydCB7IENvbW1vbk1vZHVsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XHJcbmltcG9ydCB7IE1vZHVsZVdpdGhQcm92aWRlcnMsIE5nTW9kdWxlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XHJcbmltcG9ydCB7IFJvdXRlck1vZHVsZSB9IGZyb20gJ0Bhbmd1bGFyL3JvdXRlcic7XHJcblxyXG5pbXBvcnQgeyBUb3VySG90a2V5TGlzdGVuZXJDb21wb25lbnQgfSBmcm9tICcuL3RvdXItaG90a2V5LWxpc3RlbmVyLmNvbXBvbmVudCc7XHJcbmltcG9ydCB7IFRvdXJTZXJ2aWNlIH0gZnJvbSAnLi90b3VyLnNlcnZpY2UnO1xyXG5cclxuQE5nTW9kdWxlKHtcclxuICAgIGRlY2xhcmF0aW9uczogW1RvdXJIb3RrZXlMaXN0ZW5lckNvbXBvbmVudF0sXHJcbiAgICBleHBvcnRzOiBbVG91ckhvdGtleUxpc3RlbmVyQ29tcG9uZW50XSxcclxuICAgIGltcG9ydHM6IFtDb21tb25Nb2R1bGUsIFJvdXRlck1vZHVsZV0sXHJcbn0pXHJcbmV4cG9ydCBjbGFzcyBUb3VyTW9kdWxlIHtcclxuICAgIHB1YmxpYyBzdGF0aWMgZm9yUm9vdCgpOiBNb2R1bGVXaXRoUHJvdmlkZXJzIHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBuZ01vZHVsZTogVG91ck1vZHVsZSxcclxuICAgICAgICAgICAgcHJvdmlkZXJzOiBbXHJcbiAgICAgICAgICAgICAgICBUb3VyU2VydmljZSxcclxuICAgICAgICAgICAgXSxcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG59O1xyXG5cclxuZXhwb3J0IHsgVG91clNlcnZpY2UgfTtcclxuIl0sIm5hbWVzIjpbIm1lcmdlU3RhdGljIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUE7O0lBdUJFLE1BQUc7SUFDSCxLQUFFO0lBQ0YsU0FBTTs7Ozs7OztJQUlOLE9BQVE7SUFDUixPQUFRO0lBQ1IsV0FBWTs7Ozs7Ozs7QUFHZDtJQXlDRSxxQkFDVSxNQUFjO1FBQWQsV0FBTSxHQUFOLE1BQU0sQ0FBUTtRQXhDakIsY0FBUyxHQUFlLElBQUksT0FBTyxFQUFFLENBQUM7UUFDdEMsY0FBUyxHQUFlLElBQUksT0FBTyxFQUFFLENBQUM7UUFDdEMsZ0JBQVcsR0FBaUIsSUFBSSxPQUFPLEVBQUUsQ0FBQztRQUMxQyxXQUFNLEdBQWUsSUFBSSxPQUFPLEVBQUUsQ0FBQztRQUNuQyxTQUFJLEdBQWlCLElBQUksT0FBTyxFQUFFLENBQUM7UUFDbkMsV0FBTSxHQUFlLElBQUksT0FBTyxFQUFFLENBQUM7UUFDbkMsWUFBTyxHQUFlLElBQUksT0FBTyxFQUFFLENBQUM7UUFDcEMsb0JBQWUsR0FBb0IsSUFBSSxPQUFPLEVBQUUsQ0FBQztRQUNqRCxzQkFBaUIsR0FBb0IsSUFBSSxPQUFPLEVBQUUsQ0FBQztRQUNuRCxZQUFPLEdBQTZDQSxLQUFXLENBQ3BFLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxVQUFBLEtBQUssSUFBSSxRQUFDLEVBQUUsSUFBSSxFQUFFLFVBQVUsRUFBRSxLQUFLLE9BQUEsRUFBRSxJQUFDLENBQUMsQ0FBQyxFQUNoRSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsVUFBQSxLQUFLLElBQUksUUFBQyxFQUFFLElBQUks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