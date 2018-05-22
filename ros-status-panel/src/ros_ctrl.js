import { PanelCtrl } from 'app/plugins/sdk';
import _ from 'lodash';
import './roslib.js';
import './css/ros-panel.css!';


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

    this.status = false;

    this.ros = new ROSLIB.Ros({
      url : 'ws://localhost:9090'
    });

    var parent = this;
    this.ros.on('connection', function() {
      parent.status = true;
    });

    this.ros.on('error', function(error) {
      parent.status = false;
    });

    this.ros.on('close', function() {
      parent.status = false;
    });

    const panelDefaults = {
      topic: ""
    };

    this.messages = [];
    this.topics = [];
    this.types = [];

    this.ping();
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


  ping() {

    var parent = this;
    var pingClient = new ROSLIB.Service({
      ros : this.ros,
      name : '/rosapi/nodes',
      serviceType : 'rosapi/Nodes'
    });

    var request = new ROSLIB.ServiceRequest({});
    pingClient.callService(request, function(result) {
      if (result) {
        parent.status = true;
      }
      else {
        parent.status = false;
      }
    });



    console.log("PING");
    this.nextTickPromise = this.$timeout(this.ping.bind(this), 5000);
  };
}

RosCtrl.templateUrl = 'module.html';
