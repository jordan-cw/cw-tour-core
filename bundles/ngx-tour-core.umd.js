(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/core'), require('@angular/router'), require('rxjs'), require('rxjs/operators'), require('@angular/common')) :
    typeof define === 'function' && define.amd ? define('ngx-tour-core', ['exports', '@angular/core', '@angular/router', 'rxjs', 'rxjs/operators', '@angular/common'], factory) :
    (factory((global['ngx-tour-core'] = {}),global.ng.core,global.ng.router,global.rxjs,global.rxjs.operators,global.ng.common));
}(this, (function (exports,core,router,rxjs,operators,common) { 'use strict';

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
        function TourService(router$$1) {
            this.router = router$$1;
            this.stepShow$ = new rxjs.Subject();
            this.stepHide$ = new rxjs.Subject();
            this.initialize$ = new rxjs.Subject();
            this.start$ = new rxjs.Subject();
            this.end$ = new rxjs.Subject();
            this.pause$ = new rxjs.Subject();
            this.resume$ = new rxjs.Subject();
            this.anchorRegister$ = new rxjs.Subject();
            this.anchorUnregister$ = new rxjs.Subject();
            this.events$ = rxjs.merge(this.stepShow$.pipe(operators.map(function (value) { return ({ name: 'stepShow', value: value }); })), this.stepHide$.pipe(operators.map(function (value) { return ({ name: 'stepHide', value: value }); })), this.initialize$.pipe(operators.map(function (value) { return ({ name: 'initialize', value: value }); })), this.start$.pipe(operators.map(function (value) { return ({ name: 'start', value: value }); })), this.end$.pipe(operators.map(function (value) { return ({ name: 'end', value: value }); })), this.pause$.pipe(operators.map(function (value) { return ({ name: 'pause', value: value }); })), this.resume$.pipe(operators.map(function (value) { return ({ name: 'resume', value: value }); })), this.anchorRegister$.pipe(operators.map(function (value) {
                return ({
                    name: 'anchorRegister',
                    value: value
                });
            })), this.anchorUnregister$.pipe(operators.map(function (value) {
                return ({
                    name: 'anchorUnregister',
                    value: value
                });
            })));
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
                    .pipe(operators.filter(function (event) { return event instanceof router.NavigationStart; }), operators.first())
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
                    .pipe(operators.filter(function (event) { return event instanceof router.NavigationStart; }), operators.first())
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
            { type: core.Injectable }
        ];
        /** @nocollapse */
        TourService.ctorParameters = function () {
            return [
                { type: router.Router }
            ];
        };
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
            { type: core.Component, args: [{
                        selector: 'tour-hotkey-listener',
                        template: "<ng-content></ng-content>"
                    }] }
        ];
        /** @nocollapse */
        TourHotkeyListenerComponent.ctorParameters = function () {
            return [
                { type: TourService }
            ];
        };
        TourHotkeyListenerComponent.propDecorators = {
            onEscapeKey: [{ type: core.HostListener, args: ['window:keydown.Escape',] }],
            onArrowRightKey: [{ type: core.HostListener, args: ['window:keydown.ArrowRight',] }],
            onArrowLeftKey: [{ type: core.HostListener, args: ['window:keydown.ArrowLeft',] }]
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
            { type: core.NgModule, args: [{
                        declarations: [TourHotkeyListenerComponent],
                        exports: [TourHotkeyListenerComponent],
                        imports: [common.CommonModule, router.RouterModule],
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

    exports.TourModule = TourModule;
    exports.TourService = TourService;
    exports.TourState = TourState;
    exports.TourHotkeyListenerComponent = TourHotkeyListenerComponent;

    Object.defineProperty(exports, '__esModule', { value: true });

})));

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmd4LXRvdXItY29yZS51bWQuanMubWFwIiwic291cmNlcyI6WyJuZzovL25neC10b3VyLWNvcmUvbGliL3RvdXIuc2VydmljZS50cyIsIm5nOi8vbmd4LXRvdXItY29yZS9saWIvdG91ci1ob3RrZXktbGlzdGVuZXIuY29tcG9uZW50LnRzIiwibmc6Ly9uZ3gtdG91ci1jb3JlL2xpYi90b3VyLm1vZHVsZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBJbmplY3RhYmxlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XHJcbmltcG9ydCB7IE5hdmlnYXRpb25TdGFydCwgUm91dGVyLCBVcmxTZWdtZW50IH0gZnJvbSAnQGFuZ3VsYXIvcm91dGVyJztcclxuXHJcbmltcG9ydCB7IFRvdXJBbmNob3JEaXJlY3RpdmUgfSBmcm9tICcuL3RvdXItYW5jaG9yLmRpcmVjdGl2ZSc7XHJcbmltcG9ydCB7IFN1YmplY3QsIE9ic2VydmFibGUsIG1lcmdlIGFzIG1lcmdlU3RhdGljIH0gZnJvbSAncnhqcyc7XHJcbmltcG9ydCB7IGZpcnN0LCBtYXAsIGZpbHRlciB9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgSVN0ZXBPcHRpb24ge1xyXG4gIHN0ZXBJZD86IHN0cmluZztcclxuICBhbmNob3JJZD86IHN0cmluZztcclxuICB0aXRsZT86IHN0cmluZztcclxuICBjb250ZW50Pzogc3RyaW5nO1xyXG4gIHJvdXRlPzogc3RyaW5nIHwgVXJsU2VnbWVudFtdO1xyXG4gIG5leHRTdGVwPzogbnVtYmVyIHwgc3RyaW5nO1xyXG4gIHByZXZTdGVwPzogbnVtYmVyIHwgc3RyaW5nO1xyXG4gIHBsYWNlbWVudD86IGFueTtcclxuICBwcmV2ZW50U2Nyb2xsaW5nPzogYm9vbGVhbjtcclxuICBwcmV2QnRuVGl0bGU/OiBzdHJpbmc7XHJcbiAgbmV4dEJ0blRpdGxlPzogc3RyaW5nO1xyXG4gIGVuZEJ0blRpdGxlPzogc3RyaW5nO1xyXG59XHJcblxyXG5leHBvcnQgZW51bSBUb3VyU3RhdGUge1xyXG4gIE9GRixcclxuICBPTixcclxuICBQQVVTRURcclxufVxyXG5cclxuZXhwb3J0IGVudW0gVG91ckRpcmVjdGlvbiB7XHJcbiAgTm9uZSA9IDAsXHJcbiAgTmV4dCA9IDEsXHJcbiAgUHJldmlvdXMgPSAyXHJcbn1cclxuXHJcbkBJbmplY3RhYmxlKClcclxuZXhwb3J0IGNsYXNzIFRvdXJTZXJ2aWNlPFQgZXh0ZW5kcyBJU3RlcE9wdGlvbiA9IElTdGVwT3B0aW9uPiB7XHJcbiAgcHVibGljIHN0ZXBTaG93JDogU3ViamVjdDxUPiA9IG5ldyBTdWJqZWN0KCk7XHJcbiAgcHVibGljIHN0ZXBIaWRlJDogU3ViamVjdDxUPiA9IG5ldyBTdWJqZWN0KCk7XHJcbiAgcHVibGljIGluaXRpYWxpemUkOiBTdWJqZWN0PFRbXT4gPSBuZXcgU3ViamVjdCgpO1xyXG4gIHB1YmxpYyBzdGFydCQ6IFN1YmplY3Q8VD4gPSBuZXcgU3ViamVjdCgpO1xyXG4gIHB1YmxpYyBlbmQkOiBTdWJqZWN0PGFueT4gPSBuZXcgU3ViamVjdCgpO1xyXG4gIHB1YmxpYyBwYXVzZSQ6IFN1YmplY3Q8VD4gPSBuZXcgU3ViamVjdCgpO1xyXG4gIHB1YmxpYyByZXN1bWUkOiBTdWJqZWN0PFQ+ID0gbmV3IFN1YmplY3QoKTtcclxuICBwdWJsaWMgYW5jaG9yUmVnaXN0ZXIkOiBTdWJqZWN0PHN0cmluZz4gPSBuZXcgU3ViamVjdCgpO1xyXG4gIHB1YmxpYyBhbmNob3JVbnJlZ2lzdGVyJDogU3ViamVjdDxzdHJpbmc+ID0gbmV3IFN1YmplY3QoKTtcclxuICBwdWJsaWMgZXZlbnRzJDogT2JzZXJ2YWJsZTx7IG5hbWU6IHN0cmluZzsgdmFsdWU6IGFueSB9PiA9IG1lcmdlU3RhdGljKFxyXG4gICAgdGhpcy5zdGVwU2hvdyQucGlwZShtYXAodmFsdWUgPT4gKHsgbmFtZTogJ3N0ZXBTaG93JywgdmFsdWUgfSkpKSxcclxuICAgIHRoaXMuc3RlcEhpZGUkLnBpcGUobWFwKHZhbHVlID0+ICh7IG5hbWU6ICdzdGVwSGlkZScsIHZhbHVlIH0pKSksXHJcbiAgICB0aGlzLmluaXRpYWxpemUkLnBpcGUobWFwKHZhbHVlID0+ICh7IG5hbWU6ICdpbml0aWFsaXplJywgdmFsdWUgfSkpKSxcclxuICAgIHRoaXMuc3RhcnQkLnBpcGUobWFwKHZhbHVlID0+ICh7IG5hbWU6ICdzdGFydCcsIHZhbHVlIH0pKSksXHJcbiAgICB0aGlzLmVuZCQucGlwZShtYXAodmFsdWUgPT4gKHsgbmFtZTogJ2VuZCcsIHZhbHVlIH0pKSksXHJcbiAgICB0aGlzLnBhdXNlJC5waXBlKG1hcCh2YWx1ZSA9PiAoeyBuYW1lOiAncGF1c2UnLCB2YWx1ZSB9KSkpLFxyXG4gICAgdGhpcy5yZXN1bWUkLnBpcGUobWFwKHZhbHVlID0+ICh7IG5hbWU6ICdyZXN1bWUnLCB2YWx1ZSB9KSkpLFxyXG4gICAgdGhpcy5hbmNob3JSZWdpc3RlciQucGlwZShcclxuICAgICAgbWFwKHZhbHVlID0+ICh7XHJcbiAgICAgICAgbmFtZTogJ2FuY2hvclJlZ2lzdGVyJyxcclxuICAgICAgICB2YWx1ZVxyXG4gICAgICB9KSlcclxuICAgICksXHJcbiAgICB0aGlzLmFuY2hvclVucmVnaXN0ZXIkLnBpcGUoXHJcbiAgICAgIG1hcCh2YWx1ZSA9PiAoe1xyXG4gICAgICAgIG5hbWU6ICdhbmNob3JVbnJlZ2lzdGVyJyxcclxuICAgICAgICB2YWx1ZVxyXG4gICAgICB9KSlcclxuICAgIClcclxuICApO1xyXG5cclxuICBwdWJsaWMgc3RlcHM6IFRbXSA9IFtdO1xyXG4gIHB1YmxpYyBjdXJyZW50U3RlcDogVDtcclxuXHJcbiAgcHVibGljIGFuY2hvcnM6IHsgW2FuY2hvcklkOiBzdHJpbmddOiBUb3VyQW5jaG9yRGlyZWN0aXZlIH0gPSB7fTtcclxuICBwcml2YXRlIHN0YXR1czogVG91clN0YXRlID0gVG91clN0YXRlLk9GRjtcclxuICBwcml2YXRlIGlzSG90S2V5c0VuYWJsZWQgPSB0cnVlO1xyXG4gIHByaXZhdGUgZGlyZWN0aW9uOiBUb3VyRGlyZWN0aW9uID0gVG91ckRpcmVjdGlvbi5OZXh0O1xyXG5cclxuICBjb25zdHJ1Y3RvcihcclxuICAgIHByaXZhdGUgcm91dGVyOiBSb3V0ZXIsXHJcbiAgKSB7IH1cclxuXHJcbiAgcHVibGljIGluaXRpYWxpemUoc3RlcHM6IFRbXSwgc3RlcERlZmF1bHRzPzogVCk6IHZvaWQge1xyXG4gICAgaWYgKHN0ZXBzICYmIHN0ZXBzLmxlbmd0aCA+IDApIHtcclxuICAgICAgdGhpcy5zdGF0dXMgPSBUb3VyU3RhdGUuT0ZGO1xyXG4gICAgICB0aGlzLnN0ZXBzID0gc3RlcHMubWFwKHN0ZXAgPT4gT2JqZWN0LmFzc2lnbih7fSwgc3RlcERlZmF1bHRzLCBzdGVwKSk7XHJcbiAgICAgIHRoaXMuaW5pdGlhbGl6ZSQubmV4dCh0aGlzLnN0ZXBzKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHB1YmxpYyBkaXNhYmxlSG90a2V5cygpOiB2b2lkIHtcclxuICAgIHRoaXMuaXNIb3RLZXlzRW5hYmxlZCA9IGZhbHNlO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGVuYWJsZUhvdGtleXMoKTogdm9pZCB7XHJcbiAgICB0aGlzLmlzSG90S2V5c0VuYWJsZWQgPSB0cnVlO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHN0YXJ0KCk6IHZvaWQge1xyXG4gICAgdGhpcy5zdGFydEF0KDApO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHN0YXJ0QXQoc3RlcElkOiBudW1iZXIgfCBzdHJpbmcpOiB2b2lkIHtcclxuICAgIHRoaXMuc3RhdHVzID0gVG91clN0YXRlLk9OO1xyXG4gICAgdGhpcy5nb1RvU3RlcCh0aGlzLmxvYWRTdGVwKHN0ZXBJZCkpO1xyXG4gICAgdGhpcy5zdGFydCQubmV4dCgpO1xyXG4gICAgdGhpcy5yb3V0ZXIuZXZlbnRzXHJcbiAgICAgIC5waXBlKGZpbHRlcihldmVudCA9PiBldmVudCBpbnN0YW5jZW9mIE5hdmlnYXRpb25TdGFydCksIGZpcnN0KCkpXHJcbiAgICAgIC5zdWJzY3JpYmUoKCkgPT4ge1xyXG4gICAgICAgIGlmICh0aGlzLmN1cnJlbnRTdGVwICYmIHRoaXMuY3VycmVudFN0ZXAuaGFzT3duUHJvcGVydHkoJ3JvdXRlJykpIHtcclxuICAgICAgICAgIHRoaXMuaGlkZVN0ZXAodGhpcy5jdXJyZW50U3RlcCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBlbmQoKTogdm9pZCB7XHJcbiAgICB0aGlzLnN0YXR1cyA9IFRvdXJTdGF0ZS5PRkY7XHJcbiAgICB0aGlzLmhpZGVTdGVwKHRoaXMuY3VycmVudFN0ZXApO1xyXG4gICAgdGhpcy5jdXJyZW50U3RlcCA9IHVuZGVmaW5lZDtcclxuICAgIHRoaXMuZW5kJC5uZXh0KCk7XHJcbiAgICB0aGlzLmRpcmVjdGlvbiA9IFRvdXJEaXJlY3Rpb24uTmV4dDtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBwYXVzZSgpOiB2b2lkIHtcclxuICAgIHRoaXMuc3RhdHVzID0gVG91clN0YXRlLlBBVVNFRDtcclxuICAgIHRoaXMuaGlkZVN0ZXAodGhpcy5jdXJyZW50U3RlcCk7XHJcbiAgICB0aGlzLnBhdXNlJC5uZXh0KCk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgcmVzdW1lKCk6IHZvaWQge1xyXG4gICAgdGhpcy5zdGF0dXMgPSBUb3VyU3RhdGUuT047XHJcbiAgICB0aGlzLnNob3dTdGVwKHRoaXMuY3VycmVudFN0ZXApO1xyXG4gICAgdGhpcy5yZXN1bWUkLm5leHQoKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyB0b2dnbGUocGF1c2U/OiBib29sZWFuKTogdm9pZCB7XHJcbiAgICBpZiAocGF1c2UpIHtcclxuICAgICAgaWYgKHRoaXMuY3VycmVudFN0ZXApIHtcclxuICAgICAgICB0aGlzLnBhdXNlKCk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdGhpcy5yZXN1bWUoKTtcclxuICAgICAgfVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgaWYgKHRoaXMuY3VycmVudFN0ZXApIHtcclxuICAgICAgICB0aGlzLmVuZCgpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRoaXMuc3RhcnQoKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHVibGljIG5leHQoKTogdm9pZCB7XHJcbiAgICB0aGlzLmRpcmVjdGlvbiA9IFRvdXJEaXJlY3Rpb24uTmV4dDtcclxuICAgIGlmICh0aGlzLmhhc05leHQodGhpcy5jdXJyZW50U3RlcCkpIHtcclxuICAgICAgdGhpcy5nb1RvU3RlcChcclxuICAgICAgICB0aGlzLmxvYWRTdGVwKFxyXG4gICAgICAgICAgdGhpcy5jdXJyZW50U3RlcC5uZXh0U3RlcCB8fCB0aGlzLnN0ZXBzLmluZGV4T2YodGhpcy5jdXJyZW50U3RlcCkgKyAxXHJcbiAgICAgICAgKVxyXG4gICAgICApO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhpcy5lbmQoKTtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHVibGljIGhhc05leHQoc3RlcDogVCk6IGJvb2xlYW4ge1xyXG4gICAgaWYgKCFzdGVwKSB7XHJcbiAgICAgIC8vIGNvbnNvbGUud2FybignQ2FuXFwndCBnZXQgbmV4dCBzdGVwLiBObyBjdXJyZW50U3RlcC4nKTtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIChcclxuICAgICAgc3RlcC5uZXh0U3RlcCAhPT0gdW5kZWZpbmVkIHx8XHJcbiAgICAgIHRoaXMuc3RlcHMuaW5kZXhPZihzdGVwKSA8IHRoaXMuc3RlcHMubGVuZ3RoIC0gMVxyXG4gICAgKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBwcmV2KCk6IHZvaWQge1xyXG4gICAgdGhpcy5kaXJlY3Rpb24gPSBUb3VyRGlyZWN0aW9uLlByZXZpb3VzO1xyXG4gICAgaWYgKHRoaXMuaGFzUHJldih0aGlzLmN1cnJlbnRTdGVwKSkge1xyXG4gICAgICB0aGlzLmdvVG9TdGVwKFxyXG4gICAgICAgIHRoaXMubG9hZFN0ZXAoXHJcbiAgICAgICAgICB0aGlzLmN1cnJlbnRTdGVwLnByZXZTdGVwIHx8IHRoaXMuc3RlcHMuaW5kZXhPZih0aGlzLmN1cnJlbnRTdGVwKSAtIDFcclxuICAgICAgICApXHJcbiAgICAgICk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB0aGlzLmVuZCgpO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgaGFzUHJldihzdGVwOiBUKTogYm9vbGVhbiB7XHJcbiAgICBpZiAoIXN0ZXApIHtcclxuICAgICAgLy8gY29uc29sZS53YXJuKCdDYW5cXCd0IGdldCBwcmV2aW91cyBzdGVwLiBObyBjdXJyZW50U3RlcC4nKTtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHN0ZXAucHJldlN0ZXAgIT09IHVuZGVmaW5lZCB8fCB0aGlzLnN0ZXBzLmluZGV4T2Yoc3RlcCkgPiAwO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGdvdG8oc3RlcElkOiBudW1iZXIgfCBzdHJpbmcpOiB2b2lkIHtcclxuICAgIHRoaXMuZ29Ub1N0ZXAodGhpcy5sb2FkU3RlcChzdGVwSWQpKTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyByZWdpc3RlcihhbmNob3JJZDogc3RyaW5nLCBhbmNob3I6IFRvdXJBbmNob3JEaXJlY3RpdmUpOiB2b2lkIHtcclxuICAgIGlmICghYW5jaG9ySWQpXHJcbiAgICAgIHJldHVybjtcclxuICAgIGlmICh0aGlzLmFuY2hvcnNbYW5jaG9ySWRdKSB7XHJcbiAgICAgIHRocm93IG5ldyBFcnJvcignYW5jaG9ySWQgJyArIGFuY2hvcklkICsgJyBhbHJlYWR5IHJlZ2lzdGVyZWQhJyk7XHJcbiAgICB9XHJcbiAgICB0aGlzLmFuY2hvcnNbYW5jaG9ySWRdID0gYW5jaG9yO1xyXG4gICAgdGhpcy5hbmNob3JSZWdpc3RlciQubmV4dChhbmNob3JJZCk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgdW5yZWdpc3RlcihhbmNob3JJZDogc3RyaW5nKTogdm9pZCB7XHJcbiAgICBpZiAoIWFuY2hvcklkKVxyXG4gICAgICByZXR1cm47XHJcbiAgICBkZWxldGUgdGhpcy5hbmNob3JzW2FuY2hvcklkXTtcclxuICAgIHRoaXMuYW5jaG9yVW5yZWdpc3RlciQubmV4dChhbmNob3JJZCk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZ2V0U3RhdHVzKCk6IFRvdXJTdGF0ZSB7XHJcbiAgICByZXR1cm4gdGhpcy5zdGF0dXM7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgaXNIb3RrZXlzRW5hYmxlZCgpOiBib29sZWFuIHtcclxuICAgIHJldHVybiB0aGlzLmlzSG90S2V5c0VuYWJsZWQ7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGdvVG9TdGVwKHN0ZXA6IFQpOiB2b2lkIHtcclxuICAgIGlmICghc3RlcCkge1xyXG4gICAgICAvLyBjb25zb2xlLndhcm4oJ0NhblxcJ3QgZ28gdG8gbm9uLWV4aXN0ZW50IHN0ZXAnKTtcclxuICAgICAgdGhpcy5lbmQoKTtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgbGV0IG5hdmlnYXRlUHJvbWlzZTogUHJvbWlzZTxib29sZWFuPiA9IG5ldyBQcm9taXNlKHJlc29sdmUgPT5cclxuICAgICAgcmVzb2x2ZSh0cnVlKVxyXG4gICAgKTtcclxuICAgIGlmIChzdGVwLnJvdXRlICE9PSB1bmRlZmluZWQgJiYgdHlwZW9mIHN0ZXAucm91dGUgPT09ICdzdHJpbmcnKSB7XHJcbiAgICAgIG5hdmlnYXRlUHJvbWlzZSA9IHRoaXMucm91dGVyLm5hdmlnYXRlQnlVcmwoc3RlcC5yb3V0ZSk7XHJcbiAgICB9IGVsc2UgaWYgKHN0ZXAucm91dGUgJiYgQXJyYXkuaXNBcnJheShzdGVwLnJvdXRlKSkge1xyXG4gICAgICBuYXZpZ2F0ZVByb21pc2UgPSB0aGlzLnJvdXRlci5uYXZpZ2F0ZShzdGVwLnJvdXRlKTtcclxuICAgIH1cclxuICAgIG5hdmlnYXRlUHJvbWlzZS50aGVuKG5hdmlnYXRlZCA9PiB7XHJcbiAgICAgIGlmIChuYXZpZ2F0ZWQgIT09IGZhbHNlKSB7XHJcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB0aGlzLnNldEN1cnJlbnRTdGVwKHN0ZXApKTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGxvYWRTdGVwKHN0ZXBJZDogbnVtYmVyIHwgc3RyaW5nKTogVCB7XHJcbiAgICBpZiAodHlwZW9mIHN0ZXBJZCA9PT0gJ251bWJlcicpIHtcclxuICAgICAgcmV0dXJuIHRoaXMuc3RlcHNbc3RlcElkXTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHJldHVybiB0aGlzLnN0ZXBzLmZpbmQoc3RlcCA9PiBzdGVwLnN0ZXBJZCA9PT0gc3RlcElkKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHByaXZhdGUgc2V0Q3VycmVudFN0ZXAoc3RlcDogVCk6IHZvaWQge1xyXG4gICAgaWYgKHRoaXMuY3VycmVudFN0ZXApIHtcclxuICAgICAgdGhpcy5oaWRlU3RlcCh0aGlzLmN1cnJlbnRTdGVwKTtcclxuICAgIH1cclxuICAgIHRoaXMuY3VycmVudFN0ZXAgPSBzdGVwO1xyXG4gICAgdGhpcy5zaG93U3RlcCh0aGlzLmN1cnJlbnRTdGVwKTtcclxuICAgIHRoaXMucm91dGVyLmV2ZW50c1xyXG4gICAgICAucGlwZShmaWx0ZXIoZXZlbnQgPT4gZXZlbnQgaW5zdGFuY2VvZiBOYXZpZ2F0aW9uU3RhcnQpLCBmaXJzdCgpKVxyXG4gICAgICAuc3Vic2NyaWJlKChldmVudCkgPT4ge1xyXG4gICAgICAgIGlmICh0aGlzLmN1cnJlbnRTdGVwICYmIHRoaXMuY3VycmVudFN0ZXAuaGFzT3duUHJvcGVydHkoJ3JvdXRlJykpIHtcclxuICAgICAgICAgIHRoaXMuaGlkZVN0ZXAodGhpcy5jdXJyZW50U3RlcCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgc2hvd1N0ZXAoc3RlcDogVCk6IHZvaWQge1xyXG4gICAgY29uc3QgYW5jaG9yID0gdGhpcy5hbmNob3JzW3N0ZXAgJiYgc3RlcC5hbmNob3JJZF07XHJcbiAgICBpZiAoIWFuY2hvcikge1xyXG4gICAgICBsZXQgc3RlcEluZGV4ID0gdGhpcy5zdGVwcy5pbmRleE9mKHN0ZXApO1xyXG4gICAgICB0aGlzLnNraXBTdGVwKCk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBhbmNob3Iuc2hvd1RvdXJTdGVwKHN0ZXApO1xyXG4gICAgICB0aGlzLnN0ZXBTaG93JC5uZXh0KHN0ZXApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHJvdGVjdGVkIGhpZGVTdGVwKHN0ZXA6IFQpOiB2b2lkIHtcclxuICAgIGNvbnN0IGFuY2hvciA9IHRoaXMuYW5jaG9yc1tzdGVwICYmIHN0ZXAuYW5jaG9ySWRdO1xyXG4gICAgaWYgKCFhbmNob3IpIHtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgYW5jaG9yLmhpZGVUb3VyU3RlcCgpO1xyXG4gICAgdGhpcy5zdGVwSGlkZSQubmV4dChzdGVwKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgc2tpcFN0ZXAoKSB7XHJcbiAgICBzd2l0Y2ggKHRoaXMuZGlyZWN0aW9uKSB7XHJcbiAgICAgIGNhc2UgVG91ckRpcmVjdGlvbi5OZXh0OiB7XHJcbiAgICAgICAgdGhpcy5uZXh0KCk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIH1cclxuICAgICAgY2FzZSBUb3VyRGlyZWN0aW9uLlByZXZpb3VzOiB7XHJcbiAgICAgICAgdGhpcy5wcmV2KCk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcbn1cclxuIiwiaW1wb3J0IHsgQ29tcG9uZW50LCBIb3N0TGlzdGVuZXIgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcclxuXHJcbmltcG9ydCB7IFRvdXJTZXJ2aWNlLCBUb3VyU3RhdGUgfSBmcm9tICcuL3RvdXIuc2VydmljZSc7XHJcblxyXG5AQ29tcG9uZW50KHtcclxuICBzZWxlY3RvcjogJ3RvdXItaG90a2V5LWxpc3RlbmVyJyxcclxuICB0ZW1wbGF0ZTogYDxuZy1jb250ZW50PjwvbmctY29udGVudD5gXHJcbn0pXHJcbmV4cG9ydCBjbGFzcyBUb3VySG90a2V5TGlzdGVuZXJDb21wb25lbnQge1xyXG4gIGNvbnN0cnVjdG9yKHB1YmxpYyB0b3VyU2VydmljZTogVG91clNlcnZpY2UpIHt9XHJcblxyXG4gIC8qKlxyXG4gICAqIENvbmZpZ3VyZXMgaG90IGtleXMgZm9yIGNvbnRyb2xsaW5nIHRoZSB0b3VyIHdpdGggdGhlIGtleWJvYXJkXHJcbiAgICovXHJcbiAgQEhvc3RMaXN0ZW5lcignd2luZG93OmtleWRvd24uRXNjYXBlJylcclxuICBwdWJsaWMgb25Fc2NhcGVLZXkoKTogdm9pZCB7XHJcbiAgICBpZiAoXHJcbiAgICAgIHRoaXMudG91clNlcnZpY2UuZ2V0U3RhdHVzKCkgPT09IFRvdXJTdGF0ZS5PTiAmJlxyXG4gICAgICB0aGlzLnRvdXJTZXJ2aWNlLmlzSG90a2V5c0VuYWJsZWQoKVxyXG4gICAgKSB7XHJcbiAgICAgIHRoaXMudG91clNlcnZpY2UuZW5kKCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBASG9zdExpc3RlbmVyKCd3aW5kb3c6a2V5ZG93bi5BcnJvd1JpZ2h0JylcclxuICBwdWJsaWMgb25BcnJvd1JpZ2h0S2V5KCk6IHZvaWQge1xyXG4gICAgaWYgKFxyXG4gICAgICB0aGlzLnRvdXJTZXJ2aWNlLmdldFN0YXR1cygpID09PSBUb3VyU3RhdGUuT04gJiZcclxuICAgICAgdGhpcy50b3VyU2VydmljZS5oYXNOZXh0KHRoaXMudG91clNlcnZpY2UuY3VycmVudFN0ZXApICYmXHJcbiAgICAgIHRoaXMudG91clNlcnZpY2UuaXNIb3RrZXlzRW5hYmxlZCgpXHJcbiAgICApIHtcclxuICAgICAgdGhpcy50b3VyU2VydmljZS5uZXh0KCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBASG9zdExpc3RlbmVyKCd3aW5kb3c6a2V5ZG93bi5BcnJvd0xlZnQnKVxyXG4gIHB1YmxpYyBvbkFycm93TGVmdEtleSgpOiB2b2lkIHtcclxuICAgIGlmIChcclxuICAgICAgdGhpcy50b3VyU2VydmljZS5nZXRTdGF0dXMoKSA9PT0gVG91clN0YXRlLk9OICYmXHJcbiAgICAgIHRoaXMudG91clNlcnZpY2UuaGFzUHJldih0aGlzLnRvdXJTZXJ2aWNlLmN1cnJlbnRTdGVwKSAmJlxyXG4gICAgICB0aGlzLnRvdXJTZXJ2aWNlLmlzSG90a2V5c0VuYWJsZWQoKVxyXG4gICAgKSB7XHJcbiAgICAgIHRoaXMudG91clNlcnZpY2UucHJldigpO1xyXG4gICAgfVxyXG4gIH1cclxufVxyXG4iLCJpbXBvcnQgeyBDb21tb25Nb2R1bGUgfSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xyXG5pbXBvcnQgeyBNb2R1bGVXaXRoUHJvdmlkZXJzLCBOZ01vZHVsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xyXG5pbXBvcnQgeyBSb3V0ZXJNb2R1bGUgfSBmcm9tICdAYW5ndWxhci9yb3V0ZXInO1xyXG5cclxuaW1wb3J0IHsgVG91ckhvdGtleUxpc3RlbmVyQ29tcG9uZW50IH0gZnJvbSAnLi90b3VyLWhvdGtleS1saXN0ZW5lci5jb21wb25lbnQnO1xyXG5pbXBvcnQgeyBUb3VyU2VydmljZSB9IGZyb20gJy4vdG91ci5zZXJ2aWNlJztcclxuXHJcbkBOZ01vZHVsZSh7XHJcbiAgICBkZWNsYXJhdGlvbnM6IFtUb3VySG90a2V5TGlzdGVuZXJDb21wb25lbnRdLFxyXG4gICAgZXhwb3J0czogW1RvdXJIb3RrZXlMaXN0ZW5lckNvbXBvbmVudF0sXHJcbiAgICBpbXBvcnRzOiBbQ29tbW9uTW9kdWxlLCBSb3V0ZXJNb2R1bGVdLFxyXG59KVxyXG5leHBvcnQgY2xhc3MgVG91ck1vZHVsZSB7XHJcbiAgICBwdWJsaWMgc3RhdGljIGZvclJvb3QoKTogTW9kdWxlV2l0aFByb3ZpZGVycyB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgbmdNb2R1bGU6IFRvdXJNb2R1bGUsXHJcbiAgICAgICAgICAgIHByb3ZpZGVyczogW1xyXG4gICAgICAgICAgICAgICAgVG91clNlcnZpY2UsXHJcbiAgICAgICAgICAgIF0sXHJcbiAgICAgICAgfTtcclxuICAgIH1cclxufTtcclxuXHJcbmV4cG9ydCB7IFRvdXJTZXJ2aWNlIH07XHJcbiJdLCJuYW1lcyI6WyJyb3V0ZXIiLCJTdWJqZWN0IiwibWVyZ2VTdGF0aWMiLCJtYXAiLCJmaWx0ZXIiLCJOYXZpZ2F0aW9uU3RhcnQiLCJmaXJzdCIsIkluamVjdGFibGUiLCJSb3V0ZXIiLCJDb21wb25lbnQiLCJIb3N0TGlzdGVuZXIiLCJOZ01vZHVsZSIsIkNvbW1vbk1vZHVsZSIsIlJvdXRlck1vZHVsZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUFBOztRQXVCRSxNQUFHO1FBQ0gsS0FBRTtRQUNGLFNBQU07Ozs7Ozs7UUFJTixPQUFRO1FBQ1IsT0FBUTtRQUNSLFdBQVk7Ozs7Ozs7O0FBR2Q7UUF5Q0UscUJBQ1VBLFNBQWM7WUFBZCxXQUFNLEdBQU5BLFNBQU0sQ0FBUTtZQXhDakIsY0FBUyxHQUFlLElBQUlDLFlBQU8sRUFBRSxDQUFDO1lBQ3RDLGNBQVMsR0FBZSxJQUFJQSxZQUFPLEVBQUUsQ0FBQztZQUN0QyxnQkFBVyxHQUFpQixJQUFJQSxZQUFPLEVBQUUsQ0FBQztZQUMxQyxXQUFNLEdBQWUsSUFBSUEsWUFBTyxFQUFFLENBQUM7WUFDbkMsU0FBSSxHQUFpQixJQUFJQSxZQUFPLEVBQUUsQ0FBQztZQUNuQyxXQUFNLEdBQWUsSUFBSUEsWUFBTyxFQUFFLENBQUM7WUFDbkMsWUFBTyxHQUFlLElBQUlBLFlBQU8sRUFBRSxDQUFDO1lBQ3BDLG9CQUFlLEdBQW9CLElBQUlBLFlBQU8sRUFBRSxDQUFDO1lBQ2pELHNCQUFpQixHQUFvQixJQUFJQSxZQUFPLEVBQUUsQ0FBQztZQUNuRCxZQUFPLEdBQTZDQyxVQUFXLENBQ3BFLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDQyxhQUFHLENBQUMsVUFBQSxLQUFLLElBQUksUUFBQyxFQUFFLElBQUksRUFBRSxVQUFVLEVBQUUsS0FBSyxPQUFBLEVBQUUsSUFBQyxDQUFDLENBQUMsRUFDaEUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUNBLGFBQUcsQ0FBQyxVQUFBLEtBQUssSUFBSSxRQUFDLEVBQUUsSUFBSSxFQUFFLFVBQVUsRUFBRSxLQUFLLE9BQUEsRUFBRSxJQUFDLENBQUMsQ0FBQyxFQUNoRSxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQ0EsYUFBRyxDQUFDLFVBQUEsS0FBSyxJQUFJLFFBQUMsRUFBRSxJQUFJLEVBQUUsWUFBWSxFQUFFLEtBQUssT0FBQSxFQUFFLElBQUMsQ0FBQyxDQUFDLEVBQ3BFLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDQSxhQUFHLENBQUMsVUFBQSxLQUFLLElBQUksUUFBQyxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsS0FBSyxPQUFBLEVBQUUsSUFBQyxDQUFDLENBQUMsRUFDMUQsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUNBLGFBQUcsQ0FBQyxVQUFBLEtBQUssSUFBSSxRQUFDLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxLQUFLLE9BQUEsRUFBRSxJQUFDLENBQUMsQ0FBQyxFQUN0RCxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQ0EsYUFBRyxDQUFDLFVBQUEsS0FBSyxJQUFJLFFBQUMsRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLEtBQUssT0FBQSxFQUFFLElBQUMsQ0FBQyxDQUFDLEVBQzFELElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDQSxhQUFHLENBQUMsVUFBQSxLQUFLLElBQUksUUFBQyxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsS0FBSyxPQUFBLEVBQUUsSUFBQyxDQUFDLENBQUMsRUFDNUQsSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQ3ZCQSxhQUFHLENBQUMsVUFBQSxLQUFLO2dCQUFJLFFBQUM7b0JBQ1osSUFBSSxFQUFFLGdCQUFnQjtvQkFDdEIsS0FBSyxPQUFBO2lCQUNOO2FBQUMsQ0FBQyxDQUNKLEVBQ0QsSUFBSSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FDekJBLGFBQUcsQ0FBQyxVQUFBLEtBQUs7Z0JBQUksUUFBQztvQkFDWixJQUFJLEVBQUUsa0JBQWtCO29CQUN4QixLQUFLLE9BQUE7aUJBQ047YUFBQyxDQUFDLENBQ0osQ0FDRixDQUFDO1lBRUssVUFBSyxHQUFRLEVBQUUsQ0FBQztZQUdoQixZQUFPLEdBQWdELEVBQUUsQ0FBQztZQUN6RCxXQUFNLEdBQWMsU0FBUyxDQUFDLEdBQUcsQ0FBQztZQUNsQyxxQkFBZ0IsR0FBRyxJQUFJLENBQUM7WUFDeEIsY0FBUyxHQUFrQixhQUFhLENBQUMsSUFBSSxDQUFDO1NBSWpEOzs7Ozs7UUFFRSxnQ0FBVTs7Ozs7WUFBakIsVUFBa0IsS0FBVSxFQUFFLFlBQWdCO2dCQUM1QyxJQUFJLEtBQUssSUFBSSxLQUFLLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtvQkFDN0IsSUFBSSxDQUFDLE1BQU0sR0FBRyxTQUFTLENBQUMsR0FBRyxDQUFDO29CQUM1QixJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQyxHQUFHLENBQUMsVUFBQSxJQUFJLElBQUksT0FBQSxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRSxZQUFZLEVBQUUsSUFBSSxDQUFDLEdBQUEsQ0FBQyxDQUFDO29CQUN0RSxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7aUJBQ25DO2FBQ0Y7Ozs7UUFFTSxvQ0FBYzs7O1lBQXJCO2dCQUNFLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxLQUFLLENBQUM7YUFDL0I7Ozs7UUFFTSxtQ0FBYTs7O1lBQXBCO2dCQUNFLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLENBQUM7YUFDOUI7Ozs7UUFFTSwyQkFBSzs7O1lBQVo7Z0JBQ0UsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQzthQUNqQjs7Ozs7UUFFTSw2QkFBTzs7OztZQUFkLFVBQWUsTUFBdUI7Z0JBQXRDLGlCQVdDO2dCQVZDLElBQUksQ0FBQyxNQUFNLEdBQUcsU0FBUyxDQUFDLEVBQUUsQ0FBQztnQkFDM0IsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7Z0JBQ3JDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLENBQUM7Z0JBQ25CLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTTtxQkFDZixJQUFJLENBQUNDLGdCQUFNLENBQUMsVUFBQSxLQUFLLElBQUksT0FBQSxLQUFLLFlBQVlDLHNCQUFlLEdBQUEsQ0FBQyxFQUFFQyxlQUFLLEVBQUUsQ0FBQztxQkFDaEUsU0FBUyxDQUFDO29CQUNULElBQUksS0FBSSxDQUFDLFdBQVcsSUFBSSxLQUFJLENBQUMsV0FBVyxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUMsRUFBRTt3QkFDaEUsS0FBSSxDQUFDLFFBQVEsQ0FBQyxLQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7cUJBQ2pDO2lCQUNGLENBQUMsQ0FBQzthQUNOOzs7O1FBRU0seUJBQUc7OztZQUFWO2dCQUNFLElBQUksQ0FBQyxNQUFNLEdBQUcsU0FBUyxDQUFDLEdBQUcsQ0FBQztnQkFDNUIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7Z0JBQ2hDLElBQUksQ0FBQyxXQUFXLEdBQUcsU0FBUyxDQUFDO2dCQUM3QixJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO2dCQUNqQixJQUFJLENBQUMsU0FBUyxHQUFHLGFBQWEsQ0FBQyxJQUFJLENBQUM7YUFDckM7Ozs7UUFFTSwyQkFBSzs7O1lBQVo7Z0JBQ0UsSUFBSSxDQUFDLE1BQU0sR0FBRyxTQUFTLENBQUMsTUFBTSxDQUFDO2dCQUMvQixJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztnQkFDaEMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBQzthQUNwQjs7OztRQUVNLDRCQUFNOzs7WUFBYjtnQkFDRSxJQUFJLENBQUMsTUFBTSxHQUFHLFNBQVMsQ0FBQyxFQUFFLENBQUM7Z0JBQzNCLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO2dCQUNoQyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxDQUFDO2FBQ3JCOzs7OztRQUVNLDRCQUFNOzs7O1lBQWIsVUFBYyxLQUFlO2dCQUMzQixJQUFJLEtBQUssRUFBRTtvQkFDVCxJQUFJLElBQUksQ0FBQyxXQUFXLEVBQUU7d0JBQ3BCLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztxQkFDZDt5QkFBTTt3QkFDTCxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7cUJBQ2Y7aUJBQ0Y7cUJBQU07b0JBQ0wsSUFBSSxJQUFJLENBQUMsV0FBVyxFQUFFO3dCQUNwQixJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7cUJBQ1o7eUJBQU07d0JBQ0wsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO3FCQUNkO2lCQUNGO2FBQ0Y7Ozs7UUFFTSwwQkFBSTs7O1lBQVg7Z0JBQ0UsSUFBSSxDQUFDLFNBQVMsR0FBRyxhQUFhLENBQUMsSUFBSSxDQUFDO2dCQUNwQyxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxFQUFFO29CQUNsQyxJQUFJLENBQUMsUUFBUSxDQUNYLElBQUksQ0FBQyxRQUFRLENBQ1gsSUFBSSxDQUFDLFdBQVcsQ0FBQyxRQUFRLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FDdEUsQ0FDRixDQUFDO2lCQUNIO3FCQUFNO29CQUNMLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQztvQkFDWCxPQUFPO2lCQUNSO2FBQ0Y7Ozs7O1FBRU0sNkJBQU87Ozs7WUFBZCxVQUFlLElBQU87Z0JBQ3BCLElBQUksQ0FBQyxJQUFJLEVBQUU7O29CQUVULE9BQU8sS0FBSyxDQUFDO2lCQUNkO2dCQUNELFFBQ0UsSUFBSSxDQUFDLFFBQVEsS0FBSyxTQUFTO29CQUMzQixJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQ2hEO2FBQ0g7Ozs7UUFFTSwwQkFBSTs7O1lBQVg7Z0JBQ0UsSUFBSSxDQUFDLFNBQVMsR0FBRyxhQUFhLENBQUMsUUFBUSxDQUFDO2dCQUN4QyxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxFQUFFO29CQUNsQyxJQUFJLENBQUMsUUFBUSxDQUNYLElBQUksQ0FBQyxRQUFRLENBQ1gsSUFBSSxDQUFDLFdBQVcsQ0FBQyxRQUFRLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FDdEUsQ0FDRixDQUFDO2lCQUNIO3FCQUFNO29CQUNMLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQztvQkFDWCxPQUFPO2lCQUNSO2FBQ0Y7Ozs7O1FBRU0sNkJBQU87Ozs7WUFBZCxVQUFlLElBQU87Z0JBQ3BCLElBQUksQ0FBQyxJQUFJLEVBQUU7O29CQUVULE9BQU8sS0FBSyxDQUFDO2lCQUNkO2dCQUNELE9BQU8sSUFBSSxDQUFDLFFBQVEsS0FBSyxTQUFTLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2FBQ3BFOzs7OztRQUVNLDBCQUFJOzs7O1lBQVgsVUFBWSxNQUF1QjtnQkFDakMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7YUFDdEM7Ozs7OztRQUVNLDhCQUFROzs7OztZQUFmLFVBQWdCLFFBQWdCLEVBQUUsTUFBMkI7Z0JBQzNELElBQUksQ0FBQyxRQUFRO29CQUNYLE9BQU87Z0JBQ1QsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxFQUFFO29CQUMxQixNQUFNLElBQUksS0FBSyxDQUFDLFdBQVcsR0FBRyxRQUFRLEdBQUcsc0JBQXNCLENBQUMsQ0FBQztpQkFDbEU7Z0JBQ0QsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsR0FBRyxNQUFNLENBQUM7Z0JBQ2hDLElBQUksQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO2FBQ3JDOzs7OztRQUVNLGdDQUFVOzs7O1lBQWpCLFVBQWtCLFFBQWdCO2dCQUNoQyxJQUFJLENBQUMsUUFBUTtvQkFDWCxPQUFPO2dCQUNULE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztnQkFDOUIsSUFBSSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQzthQUN2Qzs7OztRQUVNLCtCQUFTOzs7WUFBaEI7Z0JBQ0UsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDO2FBQ3BCOzs7O1FBRU0sc0NBQWdCOzs7WUFBdkI7Z0JBQ0UsT0FBTyxJQUFJLENBQUMsZ0JBQWdCLENBQUM7YUFDOUI7Ozs7OztRQUVPLDhCQUFROzs7OztZQUFoQixVQUFpQixJQUFPO2dCQUF4QixpQkFtQkM7Z0JBbEJDLElBQUksQ0FBQyxJQUFJLEVBQUU7O29CQUVULElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQztvQkFDWCxPQUFPO2lCQUNSOztvQkFDRyxlQUFlLEdBQXFCLElBQUksT0FBTyxDQUFDLFVBQUEsT0FBTztvQkFDekQsT0FBQSxPQUFPLENBQUMsSUFBSSxDQUFDO2lCQUFBLENBQ2Q7Z0JBQ0QsSUFBSSxJQUFJLENBQUMsS0FBSyxLQUFLLFNBQVMsSUFBSSxPQUFPLElBQUksQ0FBQyxLQUFLLEtBQUssUUFBUSxFQUFFO29CQUM5RCxlQUFlLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO2lCQUN6RDtxQkFBTSxJQUFJLElBQUksQ0FBQyxLQUFLLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUU7b0JBQ2xELGVBQWUsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7aUJBQ3BEO2dCQUNELGVBQWUsQ0FBQyxJQUFJLENBQUMsVUFBQSxTQUFTO29CQUM1QixJQUFJLFNBQVMsS0FBSyxLQUFLLEVBQUU7d0JBQ3ZCLFVBQVUsQ0FBQyxjQUFNLE9BQUEsS0FBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsR0FBQSxDQUFDLENBQUM7cUJBQzdDO2lCQUNGLENBQUMsQ0FBQzthQUNKOzs7Ozs7UUFFTyw4QkFBUTs7Ozs7WUFBaEIsVUFBaUIsTUFBdUI7Z0JBQ3RDLElBQUksT0FBTyxNQUFNLEtBQUssUUFBUSxFQUFFO29CQUM5QixPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7aUJBQzNCO3FCQUFNO29CQUNMLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsVUFBQSxJQUFJLElBQUksT0FBQSxJQUFJLENBQUMsTUFBTSxLQUFLLE1BQU0sR0FBQSxDQUFDLENBQUM7aUJBQ3hEO2FBQ0Y7Ozs7OztRQUVPLG9DQUFjOzs7OztZQUF0QixVQUF1QixJQUFPO2dCQUE5QixpQkFhQztnQkFaQyxJQUFJLElBQUksQ0FBQyxXQUFXLEVBQUU7b0JBQ3BCLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO2lCQUNqQztnQkFDRCxJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQztnQkFDeEIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7Z0JBQ2hDLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTTtxQkFDZixJQUFJLENBQUNGLGdCQUFNLENBQUMsVUFBQSxLQUFLLElBQUksT0FBQSxLQUFLLFlBQVlDLHNCQUFlLEdBQUEsQ0FBQyxFQUFFQyxlQUFLLEVBQUUsQ0FBQztxQkFDaEUsU0FBUyxDQUFDLFVBQUMsS0FBSztvQkFDZixJQUFJLEtBQUksQ0FBQyxXQUFXLElBQUksS0FBSSxDQUFDLFdBQVcsQ0FBQyxjQUFjLENBQUMsT0FBTyxDQUFDLEVBQUU7d0JBQ2hFLEtBQUksQ0FBQyxRQUFRLENBQUMsS0FBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO3FCQUNqQztpQkFDRixDQUFDLENBQUM7YUFDTjs7Ozs7O1FBRU8sOEJBQVE7Ozs7O1lBQWhCLFVBQWlCLElBQU87O29CQUNoQixNQUFNLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQztnQkFDbEQsSUFBSSxDQUFDLE1BQU0sRUFBRTs7d0JBQ1AsU0FBUyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQztvQkFDeEMsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO2lCQUNqQjtxQkFBTTtvQkFDTCxNQUFNLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxDQUFDO29CQUMxQixJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztpQkFDM0I7YUFDRjs7Ozs7O1FBRVMsOEJBQVE7Ozs7O1lBQWxCLFVBQW1CLElBQU87O29CQUNsQixNQUFNLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQztnQkFDbEQsSUFBSSxDQUFDLE1BQU0sRUFBRTtvQkFDWCxPQUFPO2lCQUNSO2dCQUNELE1BQU0sQ0FBQyxZQUFZLEVBQUUsQ0FBQztnQkFDdEIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7YUFDM0I7Ozs7O1FBRU8sOEJBQVE7Ozs7WUFBaEI7Z0JBQ0UsUUFBUSxJQUFJLENBQUMsU0FBUztvQkFDcEIsS0FBSyxhQUFhLENBQUMsSUFBSSxFQUFFO3dCQUN2QixJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7d0JBQ1osTUFBTTtxQkFDUDtvQkFDRCxLQUFLLGFBQWEsQ0FBQyxRQUFRLEVBQUU7d0JBQzNCLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQzt3QkFDWixNQUFNO3FCQUNQO2lCQUNGO2FBQ0Y7O29CQXpRRkMsZUFBVTs7Ozs7d0JBakNlQyxhQUFNOzs7UUEyU2hDLGtCQUFDO0tBMVFEOzs7Ozs7QUNsQ0E7UUFTRSxxQ0FBbUIsV0FBd0I7WUFBeEIsZ0JBQVcsR0FBWCxXQUFXLENBQWE7U0FBSTs7Ozs7Ozs7UUFNeEMsaURBQVc7Ozs7WUFEbEI7Z0JBRUUsSUFDRSxJQUFJLENBQUMsV0FBVyxDQUFDLFNBQVMsRUFBRSxLQUFLLFNBQVMsQ0FBQyxFQUFFO29CQUM3QyxJQUFJLENBQUMsV0FBVyxDQUFDLGdCQUFnQixFQUFFLEVBQ25DO29CQUNBLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxFQUFFLENBQUM7aUJBQ3hCO2FBQ0Y7Ozs7UUFHTSxxREFBZTs7O1lBRHRCO2dCQUVFLElBQ0UsSUFBSSxDQUFDLFdBQVcsQ0FBQyxTQUFTLEVBQUUsS0FBSyxTQUFTLENBQUMsRUFBRTtvQkFDN0MsSUFBSSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxXQUFXLENBQUM7b0JBQ3RELElBQUksQ0FBQyxXQUFXLENBQUMsZ0JBQWdCLEVBQUUsRUFDbkM7b0JBQ0EsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsQ0FBQztpQkFDekI7YUFDRjs7OztRQUdNLG9EQUFjOzs7WUFEckI7Z0JBRUUsSUFDRSxJQUFJLENBQUMsV0FBVyxDQUFDLFNBQVMsRUFBRSxLQUFLLFNBQVMsQ0FBQyxFQUFFO29CQUM3QyxJQUFJLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLFdBQVcsQ0FBQztvQkFDdEQsSUFBSSxDQUFDLFdBQVcsQ0FBQyxnQkFBZ0IsRUFBRSxFQUNuQztvQkFDQSxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxDQUFDO2lCQUN6QjthQUNGOztvQkF4Q0ZDLGNBQVMsU0FBQzt3QkFDVCxRQUFRLEVBQUUsc0JBQXNCO3dCQUNoQyxRQUFRLEVBQUUsMkJBQTJCO3FCQUN0Qzs7Ozs7d0JBTFEsV0FBVzs7OztrQ0FZakJDLGlCQUFZLFNBQUMsdUJBQXVCO3NDQVVwQ0EsaUJBQVksU0FBQywyQkFBMkI7cUNBV3hDQSxpQkFBWSxTQUFDLDBCQUEwQjs7UUFVMUMsa0NBQUM7S0F6Q0Q7Ozs7OztBQ0pBO1FBT0E7U0FjQzs7OztRQVJpQixrQkFBTzs7O1lBQXJCO2dCQUNJLE9BQU87b0JBQ0gsUUFBUSxFQUFFLFVBQVU7b0JBQ3BCLFNBQVMsRUFBRTt3QkFDUCxXQUFXO3FCQUNkO2lCQUNKLENBQUM7YUFDTDs7b0JBYkpDLGFBQVEsU0FBQzt3QkFDTixZQUFZLEVBQUUsQ0FBQywyQkFBMkIsQ0FBQzt3QkFDM0MsT0FBTyxFQUFFLENBQUMsMkJBQTJCLENBQUM7d0JBQ3RDLE9BQU8sRUFBRSxDQUFDQyxtQkFBWSxFQUFFQyxtQkFBWSxDQUFDO3FCQUN4Qzs7UUFVRCxpQkFBQztLQWREOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OyJ9