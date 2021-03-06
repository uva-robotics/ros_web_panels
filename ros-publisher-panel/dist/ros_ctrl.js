'use strict';

System.register(['app/plugins/sdk', 'lodash', './roslib.js', './css/ros-panel.css!'], function (_export, _context) {
  "use strict";

  var PanelCtrl, _, _createClass, ros, panelDefaults, RosCtrl;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _possibleConstructorReturn(self, call) {
    if (!self) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return call && (typeof call === "object" || typeof call === "function") ? call : self;
  }

  function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
    if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
  }

  return {
    setters: [function (_appPluginsSdk) {
      PanelCtrl = _appPluginsSdk.PanelCtrl;
    }, function (_lodash) {
      _ = _lodash.default;
    }, function (_roslibJs) {}, function (_cssRosPanelCss) {}],
    execute: function () {
      _createClass = function () {
        function defineProperties(target, props) {
          for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ("value" in descriptor) descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor);
          }
        }

        return function (Constructor, protoProps, staticProps) {
          if (protoProps) defineProperties(Constructor.prototype, protoProps);
          if (staticProps) defineProperties(Constructor, staticProps);
          return Constructor;
        };
      }();

      ros = new ROSLIB.Ros({
        url: 'ws://localhost:9090'
      });


      ros.on('connection', function () {
        console.log('Connected to websocket server.');
      });

      ros.on('error', function (error) {
        console.log('Error connecting to websocket server: ', error);
      });

      ros.on('close', function () {
        console.log('Connection to websocket server closed.');
      });

      panelDefaults = {
        topic: ""
      };


      $(document).on('submit', '.publishForm', function (event) {
        event.preventDefault();

        var data = {};
        $(this).serializeArray().map(function (x) {
          data[x.name] = x.value;
        });

        var publish_topic = new ROSLIB.Topic({
          ros: ros,
          name: data.topic,
          messageType: data.msg_type
        });

        var pub_data = {};
        pub_data.data = data.pub;
        publish_topic.publish(pub_data);
      });

      _export('RosCtrl', RosCtrl = function (_PanelCtrl) {
        _inherits(RosCtrl, _PanelCtrl);

        function RosCtrl($scope, $injector) {
          _classCallCheck(this, RosCtrl);

          var _this = _possibleConstructorReturn(this, (RosCtrl.__proto__ || Object.getPrototypeOf(RosCtrl)).call(this, $scope, $injector));

          _.defaultsDeep(_this.panel, panelDefaults);

          // if (!(this.panel.countdownSettings.endCountdownTime instanceof Date)) {
          // this.panel.countdownSettings.endCountdownTime = moment(this.panel.countdownSettings.endCountdownTime).toDate();
          // }

          _this.events.on('init-edit-mode', _this.onInitEditMode.bind(_this));
          _this.events.on('panel-teardown', _this.onPanelTeardown.bind(_this));
          _this.events.on('panel-initialized', _this.render.bind(_this));
          _this.events.on('render', _this.onRender.bind(_this));

          _this.msg_type = "";
          _this.messages = [];
          _this.topics = [];
          _this.types = [];

          _this.getTopics();
          return _this;
        }

        _createClass(RosCtrl, [{
          key: 'onRender',
          value: function onRender() {
            console.log("RENDERING");
          }
        }, {
          key: 'onInitEditMode',
          value: function onInitEditMode() {
            this.addEditorTab('Options', 'public/plugins/ros-publisher-panel/editor.html', 2);
          }
        }, {
          key: 'onPanelTeardown',
          value: function onPanelTeardown() {
            this.$timeout.cancel(this.nextTickPromise);
          }
        }, {
          key: 'getTopics',
          value: function getTopics() {
            var topicsClient = new ROSLIB.Service({
              ros: ros,
              name: '/rosapi/topics',
              serviceType: 'rosapi/Topics'
            });

            var request = new ROSLIB.ServiceRequest();

            var parent = this;
            topicsClient.callService(request, function (result) {
              parent.topics = result.topics;
              parent.types = result.types;
            });

            this.nextTickPromise = this.$timeout(this.getTopics.bind(this), 10000);
          }
        }]);

        return RosCtrl;
      }(PanelCtrl));

      _export('RosCtrl', RosCtrl);

      RosCtrl.templateUrl = 'module.html';
    }
  };
});
//# sourceMappingURL=ros_ctrl.js.map
