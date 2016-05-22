/*
 * Copyright 2016 Red Hat Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

module.exports = function(RED) {
    
    /**
     * Node for configuring an AMQP endpoint
     */
    function amqpEndpointNode(config) {
        
        RED.nodes.createNode(this, config)
        
        this.host = config.host
        this.port = config.port
    }
    
    RED.nodes.registerType('amqp-endpoint', amqpEndpointNode)
    
    /**
     * Node for AMQP sender
     */
    function amqpSenderNode(config) {
        
        RED.nodes.createNode(this, config);
        
        var container = require('rhea')
        
        // get endpoint configuration
        this.endpoint = config.endpoint
        this.endpointConfig = RED.nodes.getNode(this.endpoint)
        
        var node = this
        // node not yet connected
        this.status({fill:"red",shape:"dot",text:"disconnected"});
        
        if (this.endpointConfig) {
            
            // get all other configuration
			this.address = config.address;
        
            var options = { 'host' : this.endpointConfig.host, 'port' : this.endpointConfig.port }
            
            var sender;
            var address = this.address
            
            container.on('connection_open', function(context) {
                // node connected
                node.status({fill:"green",shape:"dot",text:"connected"});
                
                sender = context.connection.open_sender(address)
            })
            
            this.on('input', function(msg) {
                var message = msg.payload;
                // enough credits to send
                if (sender.sendable()) {
                    sender.send({body : message})
                }
            })
            
            container.connect(options)
        }
    }
    
    RED.nodes.registerType('amqp-sender', amqpSenderNode)
}