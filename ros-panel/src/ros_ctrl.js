import { PanelCtrl } from 'app/plugins/sdk';
import _ from 'lodash';
import './roslib.js';
import './css/ros-panel.css!';


var ros = new ROSLIB.Ros({
  url : 'ws://localhost:9090'
});

ros.on('connection', function() {
  console.log('Connected to websocket server.');
});

ros.on('error', function(error) {
  console.log('Error connecting to websocket server: ', error);
});

ros.on('close', function() {
  console.log('Connection to websocket server closed.');
});

const panelDefaults = {
  topic: ""
};

export class RosCtrl extends PanelCtrl {
  constructor($scope, $injector) {
    super($scope, $injector);
    _.defaultsDeep(this.panel, panelDefaults);

    // if (!(this.panel.countdownSettings.endCountdownTime instanceof Date)) {
      // this.panel.countdownSettings.endCountdownTime = moment(this.panel.countdownSettings.endCountdownTime).toDate();
    // }

    this.events.on('init-edit-mode', this.onInitEditMode.bind(this));
    this.events.on('panel-teardown', this.onPanelTeardown.bind(this));
    this.events.on('panel-initialized', this.render.bind(this));
    this.events.on('render', this.onRender.bind(this));

    this.messages = [];
    this.topics = [];
    this.types = [];


    console.log(this.panel.topic);
    if (this.panel.topic != "") {
      this.subscribeTopic(this.panel.topic);
    }

    this.getTopics();
  }

  onRender() {
    console.log("RENDERING");
  }

  onInitEditMode() {
    this.addEditorTab('Options', 'public/plugins/ros-panel/editor.html', 2);
  }

  onPanelTeardown() {
    this.$timeout.cancel(this.nextTickPromise);
  }

  subscribeTopic(topic) {

    var listener = new ROSLIB.Topic({
      ros : ros,
      name : topic,
      messageType : 'std_msgs/String'
    });

    var parent = this;
    this.panel.topic = topic;

    listener.subscribe(function(message) {
      parent.messages.push(message.data);
      parent.render();
    });
  }

  getTopics() {

    console.log("TOPICS");
    var topicsClient = new ROSLIB.Service({
      ros : ros,
      name : '/rosapi/topics',
      serviceType : 'rosapi/Topics'
    });

    var request = new ROSLIB.ServiceRequest();

    var parent = this;
    topicsClient.callService(request, function(result) {

      console.log(parent.topics);
      parent.topics = result.topics;
      parent.types = result.types;
    });

    this.nextTickPromise = this.$timeout(this.getTopics.bind(this), 10000);
  };
}

RosCtrl.templateUrl = 'module.html';
