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
const TourState = {
    OFF: 0,
    ON: 1,
    PAUSED: 2,
};
TourState[TourState.OFF] = 'OFF';
TourState[TourState.ON] = 'ON';
TourState[TourState.PAUSED] = 'PAUSED';
/** @enum {number} */
const TourDirection = {
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
class TourService {
    /**
     * @param {?} router
     */
    constructor(router) {
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
        this.events$ = merge(this.stepShow$.pipe(map(value => ({ name: 'stepShow', value }))), this.stepHide$.pipe(map(value => ({ name: 'stepHide', value }))), this.initialize$.pipe(map(value => ({ name: 'initialize', value }))), this.start$.pipe(map(value => ({ name: 'start', value }))), this.end$.pipe(map(value => ({ name: 'end', value }))), this.pause$.pipe(map(value => ({ name: 'pause', value }))), this.resume$.pipe(map(value => ({ name: 'resume', value }))), this.anchorRegister$.pipe(map(value => ({
            name: 'anchorRegister',
            value
        }))), this.anchorUnregister$.pipe(map(value => ({
            name: 'anchorUnregister',
            value
        }))));
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
    initialize(steps, stepDefaults) {
        if (steps && steps.length > 0) {
            this.status = TourState.OFF;
            this.steps = steps.map(step => Object.assign({}, stepDefaults, step));
            this.initialize$.next(this.steps);
        }
    }
    /**
     * @return {?}
     */
    disableHotkeys() {
        this.isHotKeysEnabled = false;
    }
    /**
     * @return {?}
     */
    enableHotkeys() {
        this.isHotKeysEnabled = true;
    }
    /**
     * @return {?}
     */
    start() {
        this.startAt(0);
    }
    /**
     * @param {?} stepId
     * @return {?}
     */
    startAt(stepId) {
        this.status = TourState.ON;
        this.goToStep(this.loadStep(stepId));
        this.start$.next();
        this.router.events
            .pipe(filter(event => event instanceof NavigationStart), first())
            .subscribe(() => {
            if (this.currentStep && this.currentStep.hasOwnProperty('route')) {
                this.hideStep(this.currentStep);
            }
        });
    }
    /**
     * @return {?}
     */
    end() {
        this.status = TourState.OFF;
        this.hideStep(this.currentStep);
        this.currentStep = undefined;
        this.end$.next();
        this.direction = TourDirection.Next;
    }
    /**
     * @return {?}
     */
    pause() {
        this.status = TourState.PAUSED;
        this.hideStep(this.currentStep);
        this.pause$.next();
    }
    /**
     * @return {?}
     */
    resume() {
        this.status = TourState.ON;
        this.showStep(this.currentStep);
        this.resume$.next();
    }
    /**
     * @param {?=} pause
     * @return {?}
     */
    toggle(pause) {
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
    }
    /**
     * @return {?}
     */
    next() {
        this.direction = TourDirection.Next;
        if (this.hasNext(this.currentStep)) {
            this.goToStep(this.loadStep(this.currentStep.nextStep || this.steps.indexOf(this.currentStep) + 1));
        }
        else {
            this.end();
            return;
        }
    }
    /**
     * @param {?} step
     * @return {?}
     */
    hasNext(step) {
        if (!step) {
            // console.warn('Can\'t get next step. No currentStep.');
            return false;
        }
        return (step.nextStep !== undefined ||
            this.steps.indexOf(step) < this.steps.length - 1);
    }
    /**
     * @return {?}
     */
    prev() {
        this.direction = TourDirection.Previous;
        if (this.hasPrev(this.currentStep)) {
            this.goToStep(this.loadStep(this.currentStep.prevStep || this.steps.indexOf(this.currentStep) - 1));
        }
        else {
            this.end();
            return;
        }
    }
    /**
     * @param {?} step
     * @return {?}
     */
    hasPrev(step) {
        if (!step) {
            // console.warn('Can\'t get previous step. No currentStep.');
            return false;
        }
        return step.prevStep !== undefined || this.steps.indexOf(step) > 0;
    }
    /**
     * @param {?} stepId
     * @return {?}
     */
    goto(stepId) {
        this.goToStep(this.loadStep(stepId));
    }
    /**
     * @param {?} anchorId
     * @param {?} anchor
     * @return {?}
     */
    register(anchorId, anchor) {
        if (!anchorId)
            return;
        if (this.anchors[anchorId]) {
            throw new Error('anchorId ' + anchorId + ' already registered!');
        }
        this.anchors[anchorId] = anchor;
        this.anchorRegister$.next(anchorId);
    }
    /**
     * @param {?} anchorId
     * @return {?}
     */
    unregister(anchorId) {
        if (!anchorId)
            return;
        delete this.anchors[anchorId];
        this.anchorUnregister$.next(anchorId);
    }
    /**
     * @return {?}
     */
    getStatus() {
        return this.status;
    }
    /**
     * @return {?}
     */
    isHotkeysEnabled() {
        return this.isHotKeysEnabled;
    }
    /**
     * @private
     * @param {?} step
     * @return {?}
     */
    goToStep(step) {
        if (!step) {
            // console.warn('Can\'t go to non-existent step');
            this.end();
            return;
        }
        /** @type {?} */
        let navigatePromise = new Promise(resolve => resolve(true));
        if (step.route !== undefined && typeof step.route === 'string') {
            navigatePromise = this.router.navigateByUrl(step.route);
        }
        else if (step.route && Array.isArray(step.route)) {
            navigatePromise = this.router.navigate(step.route);
        }
        navigatePromise.then(navigated => {
            if (navigated !== false) {
                setTimeout(() => this.setCurrentStep(step));
            }
        });
    }
    /**
     * @private
     * @param {?} stepId
     * @return {?}
     */
    loadStep(stepId) {
        if (typeof stepId === 'number') {
            return this.steps[stepId];
        }
        else {
            return this.steps.find(step => step.stepId === stepId);
        }
    }
    /**
     * @private
     * @param {?} step
     * @return {?}
     */
    setCurrentStep(step) {
        if (this.currentStep) {
            this.hideStep(this.currentStep);
        }
        this.currentStep = step;
        this.showStep(this.currentStep);
        this.router.events
            .pipe(filter(event => event instanceof NavigationStart), first())
            .subscribe((event) => {
            if (this.currentStep && this.currentStep.hasOwnProperty('route')) {
                this.hideStep(this.currentStep);
            }
        });
    }
    /**
     * @private
     * @param {?} step
     * @return {?}
     */
    showStep(step) {
        /** @type {?} */
        const anchor = this.anchors[step && step.anchorId];
        if (!anchor) {
            /** @type {?} */
            let stepIndex = this.steps.indexOf(step);
            this.skipStep();
        }
        else {
            anchor.showTourStep(step);
            this.stepShow$.next(step);
        }
    }
    /**
     * @protected
     * @param {?} step
     * @return {?}
     */
    hideStep(step) {
        /** @type {?} */
        const anchor = this.anchors[step && step.anchorId];
        if (!anchor) {
            return;
        }
        anchor.hideTourStep();
        this.stepHide$.next(step);
    }
    /**
     * @private
     * @return {?}
     */
    skipStep() {
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
    }
}
TourService.decorators = [
    { type: Injectable }
];
/** @nocollapse */
TourService.ctorParameters = () => [
    { type: Router }
];

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
class TourHotkeyListenerComponent {
    /**
     * @param {?} tourService
     */
    constructor(tourService) {
        this.tourService = tourService;
    }
    /**
     * Configures hot keys for controlling the tour with the keyboard
     * @return {?}
     */
    onEscapeKey() {
        if (this.tourService.getStatus() === TourState.ON &&
            this.tourService.isHotkeysEnabled()) {
            this.tourService.end();
        }
    }
    /**
     * @return {?}
     */
    onArrowRightKey() {
        if (this.tourService.getStatus() === TourState.ON &&
            this.tourService.hasNext(this.tourService.currentStep) &&
            this.tourService.isHotkeysEnabled()) {
            this.tourService.next();
        }
    }
    /**
     * @return {?}
     */
    onArrowLeftKey() {
        if (this.tourService.getStatus() === TourState.ON &&
            this.tourService.hasPrev(this.tourService.currentStep) &&
            this.tourService.isHotkeysEnabled()) {
            this.tourService.prev();
        }
    }
}
TourHotkeyListenerComponent.decorators = [
    { type: Component, args: [{
                selector: 'tour-hotkey-listener',
                template: `<ng-content></ng-content>`
            }] }
];
/** @nocollapse */
TourHotkeyListenerComponent.ctorParameters = () => [
    { type: TourService }
];
TourHotkeyListenerComponent.propDecorators = {
    onEscapeKey: [{ type: HostListener, args: ['window:keydown.Escape',] }],
    onArrowRightKey: [{ type: HostListener, args: ['window:keydown.ArrowRight',] }],
    onArrowLeftKey: [{ type: HostListener, args: ['window:keydown.ArrowLeft',] }]
};

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
class TourModule {
    /**
     * @return {?}
     */
    static forRoot() {
        return {
            ngModule: TourModule,
            providers: [
                TourService,
            ],
        };
    }
}
TourModule.decorators = [
    { type: NgModule, args: [{
                declarations: [TourHotkeyListenerComponent],
                exports: [TourHotkeyListenerComponent],
                imports: [CommonModule, RouterModule],
            },] }
];

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */

export { TourModule, TourService, TourState, TourHotkeyListenerComponent };

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmd4LXRvdXItY29yZS5qcy5tYXAiLCJzb3VyY2VzIjpbIm5nOi8vbmd4LXRvdXItY29yZS9saWIvdG91ci5zZXJ2aWNlLnRzIiwibmc6Ly9uZ3gtdG91ci1jb3JlL2xpYi90b3VyLWhvdGtleS1saXN0ZW5lci5jb21wb25lbnQudHMiLCJuZzovL25neC10b3VyLWNvcmUvbGliL3RvdXIubW9kdWxlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEluamVjdGFibGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcclxuaW1wb3J0IHsgTmF2aWdhdGlvblN0YXJ0LCBSb3V0ZXIsIFVybFNlZ21lbnQgfSBmcm9tICdAYW5ndWxhci9yb3V0ZXInO1xyXG5cclxuaW1wb3J0IHsgVG91ckFuY2hvckRpcmVjdGl2ZSB9IGZyb20gJy4vdG91ci1hbmNob3IuZGlyZWN0aXZlJztcclxuaW1wb3J0IHsgU3ViamVjdCwgT2JzZXJ2YWJsZSwgbWVyZ2UgYXMgbWVyZ2VTdGF0aWMgfSBmcm9tICdyeGpzJztcclxuaW1wb3J0IHsgZmlyc3QsIG1hcCwgZmlsdGVyIH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xyXG5cclxuZXhwb3J0IGludGVyZmFjZSBJU3RlcE9wdGlvbiB7XHJcbiAgc3RlcElkPzogc3RyaW5nO1xyXG4gIGFuY2hvcklkPzogc3RyaW5nO1xyXG4gIHRpdGxlPzogc3RyaW5nO1xyXG4gIGNvbnRlbnQ/OiBzdHJpbmc7XHJcbiAgcm91dGU/OiBzdHJpbmcgfCBVcmxTZWdtZW50W107XHJcbiAgbmV4dFN0ZXA/OiBudW1iZXIgfCBzdHJpbmc7XHJcbiAgcHJldlN0ZXA/OiBudW1iZXIgfCBzdHJpbmc7XHJcbiAgcGxhY2VtZW50PzogYW55O1xyXG4gIHByZXZlbnRTY3JvbGxpbmc/OiBib29sZWFuO1xyXG4gIHByZXZCdG5UaXRsZT86IHN0cmluZztcclxuICBuZXh0QnRuVGl0bGU/OiBzdHJpbmc7XHJcbiAgZW5kQnRuVGl0bGU/OiBzdHJpbmc7XHJcbn1cclxuXHJcbmV4cG9ydCBlbnVtIFRvdXJTdGF0ZSB7XHJcbiAgT0ZGLFxyXG4gIE9OLFxyXG4gIFBBVVNFRFxyXG59XHJcblxyXG5leHBvcnQgZW51bSBUb3VyRGlyZWN0aW9uIHtcclxuICBOb25lID0gMCxcclxuICBOZXh0ID0gMSxcclxuICBQcmV2aW91cyA9IDJcclxufVxyXG5cclxuQEluamVjdGFibGUoKVxyXG5leHBvcnQgY2xhc3MgVG91clNlcnZpY2U8VCBleHRlbmRzIElTdGVwT3B0aW9uID0gSVN0ZXBPcHRpb24+IHtcclxuICBwdWJsaWMgc3RlcFNob3ckOiBTdWJqZWN0PFQ+ID0gbmV3IFN1YmplY3QoKTtcclxuICBwdWJsaWMgc3RlcEhpZGUkOiBTdWJqZWN0PFQ+ID0gbmV3IFN1YmplY3QoKTtcclxuICBwdWJsaWMgaW5pdGlhbGl6ZSQ6IFN1YmplY3Q8VFtdPiA9IG5ldyBTdWJqZWN0KCk7XHJcbiAgcHVibGljIHN0YXJ0JDogU3ViamVjdDxUPiA9IG5ldyBTdWJqZWN0KCk7XHJcbiAgcHVibGljIGVuZCQ6IFN1YmplY3Q8YW55PiA9IG5ldyBTdWJqZWN0KCk7XHJcbiAgcHVibGljIHBhdXNlJDogU3ViamVjdDxUPiA9IG5ldyBTdWJqZWN0KCk7XHJcbiAgcHVibGljIHJlc3VtZSQ6IFN1YmplY3Q8VD4gPSBuZXcgU3ViamVjdCgpO1xyXG4gIHB1YmxpYyBhbmNob3JSZWdpc3RlciQ6IFN1YmplY3Q8c3RyaW5nPiA9IG5ldyBTdWJqZWN0KCk7XHJcbiAgcHVibGljIGFuY2hvclVucmVnaXN0ZXIkOiBTdWJqZWN0PHN0cmluZz4gPSBuZXcgU3ViamVjdCgpO1xyXG4gIHB1YmxpYyBldmVudHMkOiBPYnNlcnZhYmxlPHsgbmFtZTogc3RyaW5nOyB2YWx1ZTogYW55IH0+ID0gbWVyZ2VTdGF0aWMoXHJcbiAgICB0aGlzLnN0ZXBTaG93JC5waXBlKG1hcCh2YWx1ZSA9PiAoeyBuYW1lOiAnc3RlcFNob3cnLCB2YWx1ZSB9KSkpLFxyXG4gICAgdGhpcy5zdGVwSGlkZSQucGlwZShtYXAodmFsdWUgPT4gKHsgbmFtZTogJ3N0ZXBIaWRlJywgdmFsdWUgfSkpKSxcclxuICAgIHRoaXMuaW5pdGlhbGl6ZSQucGlwZShtYXAodmFsdWUgPT4gKHsgbmFtZTogJ2luaXRpYWxpemUnLCB2YWx1ZSB9KSkpLFxyXG4gICAgdGhpcy5zdGFydCQucGlwZShtYXAodmFsdWUgPT4gKHsgbmFtZTogJ3N0YXJ0JywgdmFsdWUgfSkpKSxcclxuICAgIHRoaXMuZW5kJC5waXBlKG1hcCh2YWx1ZSA9PiAoeyBuYW1lOiAnZW5kJywgdmFsdWUgfSkpKSxcclxuICAgIHRoaXMucGF1c2UkLnBpcGUobWFwKHZhbHVlID0+ICh7IG5hbWU6ICdwYXVzZScsIHZhbHVlIH0pKSksXHJcbiAgICB0aGlzLnJlc3VtZSQucGlwZShtYXAodmFsdWUgPT4gKHsgbmFtZTogJ3Jlc3VtZScsIHZhbHVlIH0pKSksXHJcbiAgICB0aGlzLmFuY2hvclJlZ2lzdGVyJC5waXBlKFxyXG4gICAgICBtYXAodmFsdWUgPT4gKHtcclxuICAgICAgICBuYW1lOiAnYW5jaG9yUmVnaXN0ZXInLFxyXG4gICAgICAgIHZhbHVlXHJcbiAgICAgIH0pKVxyXG4gICAgKSxcclxuICAgIHRoaXMuYW5jaG9yVW5yZWdpc3RlciQucGlwZShcclxuICAgICAgbWFwKHZhbHVlID0+ICh7XHJcbiAgICAgICAgbmFtZTogJ2FuY2hvclVucmVnaXN0ZXInLFxyXG4gICAgICAgIHZhbHVlXHJcbiAgICAgIH0pKVxyXG4gICAgKVxyXG4gICk7XHJcblxyXG4gIHB1YmxpYyBzdGVwczogVFtdID0gW107XHJcbiAgcHVibGljIGN1cnJlbnRTdGVwOiBUO1xyXG5cclxuICBwdWJsaWMgYW5jaG9yczogeyBbYW5jaG9ySWQ6IHN0cmluZ106IFRvdXJBbmNob3JEaXJlY3RpdmUgfSA9IHt9O1xyXG4gIHByaXZhdGUgc3RhdHVzOiBUb3VyU3RhdGUgPSBUb3VyU3RhdGUuT0ZGO1xyXG4gIHByaXZhdGUgaXNIb3RLZXlzRW5hYmxlZCA9IHRydWU7XHJcbiAgcHJpdmF0ZSBkaXJlY3Rpb246IFRvdXJEaXJlY3Rpb24gPSBUb3VyRGlyZWN0aW9uLk5leHQ7XHJcblxyXG4gIGNvbnN0cnVjdG9yKFxyXG4gICAgcHJpdmF0ZSByb3V0ZXI6IFJvdXRlcixcclxuICApIHsgfVxyXG5cclxuICBwdWJsaWMgaW5pdGlhbGl6ZShzdGVwczogVFtdLCBzdGVwRGVmYXVsdHM/OiBUKTogdm9pZCB7XHJcbiAgICBpZiAoc3RlcHMgJiYgc3RlcHMubGVuZ3RoID4gMCkge1xyXG4gICAgICB0aGlzLnN0YXR1cyA9IFRvdXJTdGF0ZS5PRkY7XHJcbiAgICAgIHRoaXMuc3RlcHMgPSBzdGVwcy5tYXAoc3RlcCA9PiBPYmplY3QuYXNzaWduKHt9LCBzdGVwRGVmYXVsdHMsIHN0ZXApKTtcclxuICAgICAgdGhpcy5pbml0aWFsaXplJC5uZXh0KHRoaXMuc3RlcHMpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHVibGljIGRpc2FibGVIb3RrZXlzKCk6IHZvaWQge1xyXG4gICAgdGhpcy5pc0hvdEtleXNFbmFibGVkID0gZmFsc2U7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZW5hYmxlSG90a2V5cygpOiB2b2lkIHtcclxuICAgIHRoaXMuaXNIb3RLZXlzRW5hYmxlZCA9IHRydWU7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgc3RhcnQoKTogdm9pZCB7XHJcbiAgICB0aGlzLnN0YXJ0QXQoMCk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgc3RhcnRBdChzdGVwSWQ6IG51bWJlciB8IHN0cmluZyk6IHZvaWQge1xyXG4gICAgdGhpcy5zdGF0dXMgPSBUb3VyU3RhdGUuT047XHJcbiAgICB0aGlzLmdvVG9TdGVwKHRoaXMubG9hZFN0ZXAoc3RlcElkKSk7XHJcbiAgICB0aGlzLnN0YXJ0JC5uZXh0KCk7XHJcbiAgICB0aGlzLnJvdXRlci5ldmVudHNcclxuICAgICAgLnBpcGUoZmlsdGVyKGV2ZW50ID0+IGV2ZW50IGluc3RhbmNlb2YgTmF2aWdhdGlvblN0YXJ0KSwgZmlyc3QoKSlcclxuICAgICAgLnN1YnNjcmliZSgoKSA9PiB7XHJcbiAgICAgICAgaWYgKHRoaXMuY3VycmVudFN0ZXAgJiYgdGhpcy5jdXJyZW50U3RlcC5oYXNPd25Qcm9wZXJ0eSgncm91dGUnKSkge1xyXG4gICAgICAgICAgdGhpcy5oaWRlU3RlcCh0aGlzLmN1cnJlbnRTdGVwKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGVuZCgpOiB2b2lkIHtcclxuICAgIHRoaXMuc3RhdHVzID0gVG91clN0YXRlLk9GRjtcclxuICAgIHRoaXMuaGlkZVN0ZXAodGhpcy5jdXJyZW50U3RlcCk7XHJcbiAgICB0aGlzLmN1cnJlbnRTdGVwID0gdW5kZWZpbmVkO1xyXG4gICAgdGhpcy5lbmQkLm5leHQoKTtcclxuICAgIHRoaXMuZGlyZWN0aW9uID0gVG91ckRpcmVjdGlvbi5OZXh0O1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHBhdXNlKCk6IHZvaWQge1xyXG4gICAgdGhpcy5zdGF0dXMgPSBUb3VyU3RhdGUuUEFVU0VEO1xyXG4gICAgdGhpcy5oaWRlU3RlcCh0aGlzLmN1cnJlbnRTdGVwKTtcclxuICAgIHRoaXMucGF1c2UkLm5leHQoKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyByZXN1bWUoKTogdm9pZCB7XHJcbiAgICB0aGlzLnN0YXR1cyA9IFRvdXJTdGF0ZS5PTjtcclxuICAgIHRoaXMuc2hvd1N0ZXAodGhpcy5jdXJyZW50U3RlcCk7XHJcbiAgICB0aGlzLnJlc3VtZSQubmV4dCgpO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHRvZ2dsZShwYXVzZT86IGJvb2xlYW4pOiB2b2lkIHtcclxuICAgIGlmIChwYXVzZSkge1xyXG4gICAgICBpZiAodGhpcy5jdXJyZW50U3RlcCkge1xyXG4gICAgICAgIHRoaXMucGF1c2UoKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICB0aGlzLnJlc3VtZSgpO1xyXG4gICAgICB9XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBpZiAodGhpcy5jdXJyZW50U3RlcCkge1xyXG4gICAgICAgIHRoaXMuZW5kKCk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdGhpcy5zdGFydCgpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgbmV4dCgpOiB2b2lkIHtcclxuICAgIHRoaXMuZGlyZWN0aW9uID0gVG91ckRpcmVjdGlvbi5OZXh0O1xyXG4gICAgaWYgKHRoaXMuaGFzTmV4dCh0aGlzLmN1cnJlbnRTdGVwKSkge1xyXG4gICAgICB0aGlzLmdvVG9TdGVwKFxyXG4gICAgICAgIHRoaXMubG9hZFN0ZXAoXHJcbiAgICAgICAgICB0aGlzLmN1cnJlbnRTdGVwLm5leHRTdGVwIHx8IHRoaXMuc3RlcHMuaW5kZXhPZih0aGlzLmN1cnJlbnRTdGVwKSArIDFcclxuICAgICAgICApXHJcbiAgICAgICk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB0aGlzLmVuZCgpO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgaGFzTmV4dChzdGVwOiBUKTogYm9vbGVhbiB7XHJcbiAgICBpZiAoIXN0ZXApIHtcclxuICAgICAgLy8gY29uc29sZS53YXJuKCdDYW5cXCd0IGdldCBuZXh0IHN0ZXAuIE5vIGN1cnJlbnRTdGVwLicpO1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gKFxyXG4gICAgICBzdGVwLm5leHRTdGVwICE9PSB1bmRlZmluZWQgfHxcclxuICAgICAgdGhpcy5zdGVwcy5pbmRleE9mKHN0ZXApIDwgdGhpcy5zdGVwcy5sZW5ndGggLSAxXHJcbiAgICApO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHByZXYoKTogdm9pZCB7XHJcbiAgICB0aGlzLmRpcmVjdGlvbiA9IFRvdXJEaXJlY3Rpb24uUHJldmlvdXM7XHJcbiAgICBpZiAodGhpcy5oYXNQcmV2KHRoaXMuY3VycmVudFN0ZXApKSB7XHJcbiAgICAgIHRoaXMuZ29Ub1N0ZXAoXHJcbiAgICAgICAgdGhpcy5sb2FkU3RlcChcclxuICAgICAgICAgIHRoaXMuY3VycmVudFN0ZXAucHJldlN0ZXAgfHwgdGhpcy5zdGVwcy5pbmRleE9mKHRoaXMuY3VycmVudFN0ZXApIC0gMVxyXG4gICAgICAgIClcclxuICAgICAgKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRoaXMuZW5kKCk7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHB1YmxpYyBoYXNQcmV2KHN0ZXA6IFQpOiBib29sZWFuIHtcclxuICAgIGlmICghc3RlcCkge1xyXG4gICAgICAvLyBjb25zb2xlLndhcm4oJ0NhblxcJ3QgZ2V0IHByZXZpb3VzIHN0ZXAuIE5vIGN1cnJlbnRTdGVwLicpO1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gc3RlcC5wcmV2U3RlcCAhPT0gdW5kZWZpbmVkIHx8IHRoaXMuc3RlcHMuaW5kZXhPZihzdGVwKSA+IDA7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZ290byhzdGVwSWQ6IG51bWJlciB8IHN0cmluZyk6IHZvaWQge1xyXG4gICAgdGhpcy5nb1RvU3RlcCh0aGlzLmxvYWRTdGVwKHN0ZXBJZCkpO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHJlZ2lzdGVyKGFuY2hvcklkOiBzdHJpbmcsIGFuY2hvcjogVG91ckFuY2hvckRpcmVjdGl2ZSk6IHZvaWQge1xyXG4gICAgaWYgKCFhbmNob3JJZClcclxuICAgICAgcmV0dXJuO1xyXG4gICAgaWYgKHRoaXMuYW5jaG9yc1thbmNob3JJZF0pIHtcclxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdhbmNob3JJZCAnICsgYW5jaG9ySWQgKyAnIGFscmVhZHkgcmVnaXN0ZXJlZCEnKTtcclxuICAgIH1cclxuICAgIHRoaXMuYW5jaG9yc1thbmNob3JJZF0gPSBhbmNob3I7XHJcbiAgICB0aGlzLmFuY2hvclJlZ2lzdGVyJC5uZXh0KGFuY2hvcklkKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyB1bnJlZ2lzdGVyKGFuY2hvcklkOiBzdHJpbmcpOiB2b2lkIHtcclxuICAgIGlmICghYW5jaG9ySWQpXHJcbiAgICAgIHJldHVybjtcclxuICAgIGRlbGV0ZSB0aGlzLmFuY2hvcnNbYW5jaG9ySWRdO1xyXG4gICAgdGhpcy5hbmNob3JVbnJlZ2lzdGVyJC5uZXh0KGFuY2hvcklkKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBnZXRTdGF0dXMoKTogVG91clN0YXRlIHtcclxuICAgIHJldHVybiB0aGlzLnN0YXR1cztcclxuICB9XHJcblxyXG4gIHB1YmxpYyBpc0hvdGtleXNFbmFibGVkKCk6IGJvb2xlYW4ge1xyXG4gICAgcmV0dXJuIHRoaXMuaXNIb3RLZXlzRW5hYmxlZDtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgZ29Ub1N0ZXAoc3RlcDogVCk6IHZvaWQge1xyXG4gICAgaWYgKCFzdGVwKSB7XHJcbiAgICAgIC8vIGNvbnNvbGUud2FybignQ2FuXFwndCBnbyB0byBub24tZXhpc3RlbnQgc3RlcCcpO1xyXG4gICAgICB0aGlzLmVuZCgpO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICBsZXQgbmF2aWdhdGVQcm9taXNlOiBQcm9taXNlPGJvb2xlYW4+ID0gbmV3IFByb21pc2UocmVzb2x2ZSA9PlxyXG4gICAgICByZXNvbHZlKHRydWUpXHJcbiAgICApO1xyXG4gICAgaWYgKHN0ZXAucm91dGUgIT09IHVuZGVmaW5lZCAmJiB0eXBlb2Ygc3RlcC5yb3V0ZSA9PT0gJ3N0cmluZycpIHtcclxuICAgICAgbmF2aWdhdGVQcm9taXNlID0gdGhpcy5yb3V0ZXIubmF2aWdhdGVCeVVybChzdGVwLnJvdXRlKTtcclxuICAgIH0gZWxzZSBpZiAoc3RlcC5yb3V0ZSAmJiBBcnJheS5pc0FycmF5KHN0ZXAucm91dGUpKSB7XHJcbiAgICAgIG5hdmlnYXRlUHJvbWlzZSA9IHRoaXMucm91dGVyLm5hdmlnYXRlKHN0ZXAucm91dGUpO1xyXG4gICAgfVxyXG4gICAgbmF2aWdhdGVQcm9taXNlLnRoZW4obmF2aWdhdGVkID0+IHtcclxuICAgICAgaWYgKG5hdmlnYXRlZCAhPT0gZmFsc2UpIHtcclxuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHRoaXMuc2V0Q3VycmVudFN0ZXAoc3RlcCkpO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgbG9hZFN0ZXAoc3RlcElkOiBudW1iZXIgfCBzdHJpbmcpOiBUIHtcclxuICAgIGlmICh0eXBlb2Ygc3RlcElkID09PSAnbnVtYmVyJykge1xyXG4gICAgICByZXR1cm4gdGhpcy5zdGVwc1tzdGVwSWRdO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgcmV0dXJuIHRoaXMuc3RlcHMuZmluZChzdGVwID0+IHN0ZXAuc3RlcElkID09PSBzdGVwSWQpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBzZXRDdXJyZW50U3RlcChzdGVwOiBUKTogdm9pZCB7XHJcbiAgICBpZiAodGhpcy5jdXJyZW50U3RlcCkge1xyXG4gICAgICB0aGlzLmhpZGVTdGVwKHRoaXMuY3VycmVudFN0ZXApO1xyXG4gICAgfVxyXG4gICAgdGhpcy5jdXJyZW50U3RlcCA9IHN0ZXA7XHJcbiAgICB0aGlzLnNob3dTdGVwKHRoaXMuY3VycmVudFN0ZXApO1xyXG4gICAgdGhpcy5yb3V0ZXIuZXZlbnRzXHJcbiAgICAgIC5waXBlKGZpbHRlcihldmVudCA9PiBldmVudCBpbnN0YW5jZW9mIE5hdmlnYXRpb25TdGFydCksIGZpcnN0KCkpXHJcbiAgICAgIC5zdWJzY3JpYmUoKGV2ZW50KSA9PiB7XHJcbiAgICAgICAgaWYgKHRoaXMuY3VycmVudFN0ZXAgJiYgdGhpcy5jdXJyZW50U3RlcC5oYXNPd25Qcm9wZXJ0eSgncm91dGUnKSkge1xyXG4gICAgICAgICAgdGhpcy5oaWRlU3RlcCh0aGlzLmN1cnJlbnRTdGVwKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBzaG93U3RlcChzdGVwOiBUKTogdm9pZCB7XHJcbiAgICBjb25zdCBhbmNob3IgPSB0aGlzLmFuY2hvcnNbc3RlcCAmJiBzdGVwLmFuY2hvcklkXTtcclxuICAgIGlmICghYW5jaG9yKSB7XHJcbiAgICAgIGxldCBzdGVwSW5kZXggPSB0aGlzLnN0ZXBzLmluZGV4T2Yoc3RlcCk7XHJcbiAgICAgIHRoaXMuc2tpcFN0ZXAoKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGFuY2hvci5zaG93VG91clN0ZXAoc3RlcCk7XHJcbiAgICAgIHRoaXMuc3RlcFNob3ckLm5leHQoc3RlcCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwcm90ZWN0ZWQgaGlkZVN0ZXAoc3RlcDogVCk6IHZvaWQge1xyXG4gICAgY29uc3QgYW5jaG9yID0gdGhpcy5hbmNob3JzW3N0ZXAgJiYgc3RlcC5hbmNob3JJZF07XHJcbiAgICBpZiAoIWFuY2hvcikge1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICBhbmNob3IuaGlkZVRvdXJTdGVwKCk7XHJcbiAgICB0aGlzLnN0ZXBIaWRlJC5uZXh0KHN0ZXApO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBza2lwU3RlcCgpIHtcclxuICAgIHN3aXRjaCAodGhpcy5kaXJlY3Rpb24pIHtcclxuICAgICAgY2FzZSBUb3VyRGlyZWN0aW9uLk5leHQ6IHtcclxuICAgICAgICB0aGlzLm5leHQoKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgfVxyXG4gICAgICBjYXNlIFRvdXJEaXJlY3Rpb24uUHJldmlvdXM6IHtcclxuICAgICAgICB0aGlzLnByZXYoKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxufVxyXG4iLCJpbXBvcnQgeyBDb21wb25lbnQsIEhvc3RMaXN0ZW5lciB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xyXG5cclxuaW1wb3J0IHsgVG91clNlcnZpY2UsIFRvdXJTdGF0ZSB9IGZyb20gJy4vdG91ci5zZXJ2aWNlJztcclxuXHJcbkBDb21wb25lbnQoe1xyXG4gIHNlbGVjdG9yOiAndG91ci1ob3RrZXktbGlzdGVuZXInLFxyXG4gIHRlbXBsYXRlOiBgPG5nLWNvbnRlbnQ+PC9uZy1jb250ZW50PmBcclxufSlcclxuZXhwb3J0IGNsYXNzIFRvdXJIb3RrZXlMaXN0ZW5lckNvbXBvbmVudCB7XHJcbiAgY29uc3RydWN0b3IocHVibGljIHRvdXJTZXJ2aWNlOiBUb3VyU2VydmljZSkge31cclxuXHJcbiAgLyoqXHJcbiAgICogQ29uZmlndXJlcyBob3Qga2V5cyBmb3IgY29udHJvbGxpbmcgdGhlIHRvdXIgd2l0aCB0aGUga2V5Ym9hcmRcclxuICAgKi9cclxuICBASG9zdExpc3RlbmVyKCd3aW5kb3c6a2V5ZG93bi5Fc2NhcGUnKVxyXG4gIHB1YmxpYyBvbkVzY2FwZUtleSgpOiB2b2lkIHtcclxuICAgIGlmIChcclxuICAgICAgdGhpcy50b3VyU2VydmljZS5nZXRTdGF0dXMoKSA9PT0gVG91clN0YXRlLk9OICYmXHJcbiAgICAgIHRoaXMudG91clNlcnZpY2UuaXNIb3RrZXlzRW5hYmxlZCgpXHJcbiAgICApIHtcclxuICAgICAgdGhpcy50b3VyU2VydmljZS5lbmQoKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIEBIb3N0TGlzdGVuZXIoJ3dpbmRvdzprZXlkb3duLkFycm93UmlnaHQnKVxyXG4gIHB1YmxpYyBvbkFycm93UmlnaHRLZXkoKTogdm9pZCB7XHJcbiAgICBpZiAoXHJcbiAgICAgIHRoaXMudG91clNlcnZpY2UuZ2V0U3RhdHVzKCkgPT09IFRvdXJTdGF0ZS5PTiAmJlxyXG4gICAgICB0aGlzLnRvdXJTZXJ2aWNlLmhhc05leHQodGhpcy50b3VyU2VydmljZS5jdXJyZW50U3RlcCkgJiZcclxuICAgICAgdGhpcy50b3VyU2VydmljZS5pc0hvdGtleXNFbmFibGVkKClcclxuICAgICkge1xyXG4gICAgICB0aGlzLnRvdXJTZXJ2aWNlLm5leHQoKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIEBIb3N0TGlzdGVuZXIoJ3dpbmRvdzprZXlkb3duLkFycm93TGVmdCcpXHJcbiAgcHVibGljIG9uQXJyb3dMZWZ0S2V5KCk6IHZvaWQge1xyXG4gICAgaWYgKFxyXG4gICAgICB0aGlzLnRvdXJTZXJ2aWNlLmdldFN0YXR1cygpID09PSBUb3VyU3RhdGUuT04gJiZcclxuICAgICAgdGhpcy50b3VyU2VydmljZS5oYXNQcmV2KHRoaXMudG91clNlcnZpY2UuY3VycmVudFN0ZXApICYmXHJcbiAgICAgIHRoaXMudG91clNlcnZpY2UuaXNIb3RrZXlzRW5hYmxlZCgpXHJcbiAgICApIHtcclxuICAgICAgdGhpcy50b3VyU2VydmljZS5wcmV2KCk7XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcbiIsImltcG9ydCB7IENvbW1vbk1vZHVsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XHJcbmltcG9ydCB7IE1vZHVsZVdpdGhQcm92aWRlcnMsIE5nTW9kdWxlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XHJcbmltcG9ydCB7IFJvdXRlck1vZHVsZSB9IGZyb20gJ0Bhbmd1bGFyL3JvdXRlcic7XHJcblxyXG5pbXBvcnQgeyBUb3VySG90a2V5TGlzdGVuZXJDb21wb25lbnQgfSBmcm9tICcuL3RvdXItaG90a2V5LWxpc3RlbmVyLmNvbXBvbmVudCc7XHJcbmltcG9ydCB7IFRvdXJTZXJ2aWNlIH0gZnJvbSAnLi90b3VyLnNlcnZpY2UnO1xyXG5cclxuQE5nTW9kdWxlKHtcclxuICAgIGRlY2xhcmF0aW9uczogW1RvdXJIb3RrZXlMaXN0ZW5lckNvbXBvbmVudF0sXHJcbiAgICBleHBvcnRzOiBbVG91ckhvdGtleUxpc3RlbmVyQ29tcG9uZW50XSxcclxuICAgIGltcG9ydHM6IFtDb21tb25Nb2R1bGUsIFJvdXRlck1vZHVsZV0sXHJcbn0pXHJcbmV4cG9ydCBjbGFzcyBUb3VyTW9kdWxlIHtcclxuICAgIHB1YmxpYyBzdGF0aWMgZm9yUm9vdCgpOiBNb2R1bGVXaXRoUHJvdmlkZXJzIHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBuZ01vZHVsZTogVG91ck1vZHVsZSxcclxuICAgICAgICAgICAgcHJvdmlkZXJzOiBbXHJcbiAgICAgICAgICAgICAgICBUb3VyU2VydmljZSxcclxuICAgICAgICAgICAgXSxcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG59O1xyXG5cclxuZXhwb3J0IHsgVG91clNlcnZpY2UgfTtcclxuIl0sIm5hbWVzIjpbIm1lcmdlU3RhdGljIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUE7O0lBdUJFLE1BQUc7SUFDSCxLQUFFO0lBQ0YsU0FBTTs7Ozs7OztJQUlOLE9BQVE7SUFDUixPQUFRO0lBQ1IsV0FBWTs7Ozs7Ozs7QUFJZCxNQUFhLFdBQVc7Ozs7SUF3Q3RCLFlBQ1UsTUFBYztRQUFkLFdBQU0sR0FBTixNQUFNLENBQVE7UUF4Q2pCLGNBQVMsR0FBZSxJQUFJLE9BQU8sRUFBRSxDQUFDO1FBQ3RDLGNBQVMsR0FBZSxJQUFJLE9BQU8sRUFBRSxDQUFDO1FBQ3RDLGdCQUFXLEdBQWlCLElBQUksT0FBTyxFQUFFLENBQUM7UUFDMUMsV0FBTSxHQUFlLElBQUksT0FBTyxFQUFFLENBQUM7UUFDbkMsU0FBSSxHQUFpQixJQUFJLE9BQU8sRUFBRSxDQUFDO1FBQ25DLFdBQU0sR0FBZSxJQUFJLE9BQU8sRUFBRSxDQUFDO1FBQ25DLFlBQU8sR0FBZSxJQUFJLE9BQU8sRUFBRSxDQUFDO1FBQ3BDLG9CQUFlLEdBQW9CLElBQUksT0FBTyxFQUFFLENBQUM7UUFDakQsc0JBQWlCLEdBQW9CLElBQUksT0FBTyxFQUFFLENBQUM7UUFDbkQsWUFBTyxHQUE2Q0EsS0FBVyxDQUNwRSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxLQUFLLEVBQUUsSUFBSSxFQUFFLFVBQVUsRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFDaEUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssS0FBSyxFQUFFLElBQUksRUFBRSxVQUFVLEVB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