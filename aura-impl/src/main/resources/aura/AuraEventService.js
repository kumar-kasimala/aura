/*
 * Copyright (C) 2013 salesforce.com, inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/*jslint sub: true */
/**
 * @description The Aura Event Service, accessible using $A.eventService. Creates and Manages Events.
 * @constructor
 */
var AuraEventService = function() {
    /* private properties and methods */
    var registry = new EventDefRegistry(),
        eventDispatcher = {};

    function qualifyEventName(event) {
        if(event.indexOf("://") == -1){
            event = "markup://"+event;
        }
        return event;
    }

    var eventService = {

        /**
         * Creates a new application event. Set the event parameters using <code>event.setParams()</code> and fire
         * it using <code>event.fire()</code>. For example, <code>$A.eventService.newEvent("app:navError")</code>
         * fires the <code>app:navError</code> event. Set parameters on the new event
         * by using <code>event.setParams()</code>.
         *
         * @param {String} name The event object in the format namespace:component
         * @memberOf AuraEventService
         * @public
         */
        newEvent : function(name){
            aura.assert(name, "name");

            name = qualifyEventName(name);
            var eventDef = $A.services.event.getEventDef(name);
            if (!eventDef) {
                return null;
            }

            var config = {};
            config["eventDef"] = eventDef;
            config["eventDispatcher"] = eventDispatcher;

            return new Event(config);

        },

        /**
         * Returns the new event.
         * @param {String} name The event object in the format namespace:component
         * @memberOf AuraEventService
         * @public
         */
        get : function(name) {
            return $A.services.event.newEvent(name);
        },

        /**
         * Adds an event handler.
         * @param {Object} config The data for the event handler
         * @memberOf AuraEventService
         * @public
         */
        addHandler : function(config) {
            config["event"] = qualifyEventName(config["event"]);

            var handlers = eventDispatcher[config["event"]];
            if (!handlers) {
                handlers = {};
                eventDispatcher[config["event"]] = handlers;
            }
            var cmpHandlers = handlers[config["globalId"]];
            if (cmpHandlers === undefined) {
                cmpHandlers = [];
                handlers[config["globalId"]] = cmpHandlers;
            }
            cmpHandlers.push(config["handler"]);
        },

        /**
         * Removes an event handler.
         * @param {Object} config The data for the event
         * @memberOf AuraEventService
         * @public
         */
        removeHandler : function(config) {
            config["event"] = qualifyEventName(config["event"]);

            var handlers = eventDispatcher[config["event"]];
            if (handlers) {
                delete handlers[config["globalId"]];
            }
        },

        /**
         * Returns the event definition.
         * @param {Object} config The parameters for the event
         * @return {EventDef} The event definition.
         * @memberOf AuraEventService
         * @public
         */
        getEventDef : function(config) {
            return registry.getEventDef(config);
        },

        /**
         * Returns true if the event has handlers.
         * @param {String} name The event name
         * @memberOf AuraEventService
         * @public
         */
        hasHandlers : function(name) {
            name = qualifyEventName(name);

            return !$A.util.isUndefined(eventDispatcher[name]);
        }
        //#if {"excludeModes" : ["PRODUCTION", "PRODUCTIONDEBUG"]}
        ,
        /**
         * Returns the qualified name of all events known to the registry.
         * Available in DEV mode only.
         * @memberOf AuraEventService
         * @public
         */
        getRegisteredEvents : function() {
            var ret = "";
            for ( var event in registry.eventDefs) {
                ret = ret + event;
                ret = ret + "\n";
            }
            return ret;
        },
        hasPendingEvents : function() {
            return $A.clientService.inAuraLoop();
        }
    //#end
    };
    // #include aura.AuraEventService_export
    return eventService;
};
