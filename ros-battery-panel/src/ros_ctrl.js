import { PanelCtrl } from 'app/plugins/sdk';
import _ from 'lodash';
import './roslib.js';
import './css/ros-panel.css!';

const panelDefaults = {
  topic: ""
};

export class RosCtrl extends PanelCtrl {
  constructor($scope, $injector) {
    super($scope, $injector);
    _.defaultsDeep(this.panel, panelDefaults);



    this.events.on('init-edit-mode', this.onInitEditMode.bind(this));
    this.events.on('panel-teardown', this.onPanelTeardown.bind(this));
    this.events.on('panel-initialized', this.render.bind(this));

    this.ros = new ROSLIB.Ros({
      url : 'ws://localhost:9090'
    });

    if (this.panel.topic != "") {
      this.subscribeTopic(this.panel.topic);
    }

    this.topics = [];
    this.types = [];
    this.battery_level = 0;
    this.getTopics();
  }

  onInitEditMode() {
    this.addEditorTab('Options', 'public/plugins/ros-publisher-panel/editor.html', 2);
  }

  onPanelTeardown() {
    this.$timeout.cancel(this.nextTickPromise);
  }


  subscribeTopic(topic) {
    var listener = new ROSLIB.Topic({
      ros : this.ros,
      name : topic,
      messageType : 'std_msgs/String'
    });

    this.panel.topic = topic;
    var parent = this;
    listener.subscribe(function(message) {
      console.log(message);
      parent.battery_level = message.data;
    });
  }

  getTopics() {
    var topicsClient = new ROSLIB.Service({
      ros : this.ros,
      name : '/rosapi/topics',
      serviceType : 'rosapi/Topics'
    });

    var request = new ROSLIB.ServiceRequest();

    var parent = this;
    topicsClient.callService(request, function(result) {
      parent.topics = result.topics;
      parent.types = result.types;
    });

    this.nextTickPromise = this.$timeout(this.getTopics.bind(this), 10000);
  };
}

RosCtrl.templateUrl = 'module.html';
