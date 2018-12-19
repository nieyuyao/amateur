import * as PIXI from "pixi.js";
import Task from "src/common/js/task/Task";
let _textureCache = PIXI.utils.TextureCache;

class Element extends PIXI.Container {
  constructor(options = {}) {
    super();
    this.container = new PIXI.Container();
    this.id = options.id || "";
    this.type = "element";
    this.curStyle = this.style = options.style || {};
    this.borderRadius = this.curStyle.borderRadius || 0;
    this.clickStyle = mixStyle(this.style, options.clickStyle || {});
    this.painter = null;
    this.interactive = true;
    this.scrollAble = false;
    this.scrollDirection = 1; // 1 上下滚动 2 左右滚动
    this.marginTop = 0;
    this.marginRight = 0;
    this.marginBottom = 0;
    this.marginLeft = 0;
    this.masked = false;
    this.originWidth = this.originHeight = 0;
    this.drawStyle();
    this.backgroundImage = this.style.backgroundImage || "";
    this.clickBackgroundImage = this.clickStyle.backgroundImage || "";
    this.drawBackgroundImg();
    super.addChild(this.container); //element 自身的容器
    this.width = options.width || 0;
    this.height = options.height || 0;
  }
  get width() {
    return this.originWidth;
  }
  set width(value) {
    this._width = this.originWidth = value;
    if (this.maksed) {
      this.setOutRnage();
    }
    if (this.textEle) {
      this.textEle.x = (this.width - this.textEle.width) / 2;
    }
    if (this.bgImg) {
      this.bgImg.width = value;
    }
    if (this.clickBgImg) {
      this.clickBgImg.width = value;
    }
    this.drawStyle();
  }
  get height() {
    return this.originHeight;
  }
  set height(value) {
    this._height = this.originHeight = value;
    if (this.maksed) {
      this.setOutRnage();
    }
    if (this.textEle) {
      this.textEle.y = (this.height - this.textEle.height) / 2;
    }
    if (this.bgImg) {
      this.bgImg.height = value;
    }
    if (this.clickBgImg) {
      this.clickBgImg.height = value;
    }
    this.drawStyle();
  }
  get x() {
    return this.position.x;
  }
  set x(value) {
    this.transform.position.x = value;
    if (this.maksed) {
      this.setOutRnage();
    }
    this.drawStyle();
  }
  get y() {
    return this.position.y;
  }
  set y(value) {
    this.transform.position.y = value;
    if (this.maksed) {
      this.setOutRnage();
    }
    this.drawStyle();
  }
  //绘图的起点
  //去除margin的部分开始计算起点
  get _x() {
    return this.marginLeft;
  }
  get _y() {
    return this.marginTop;
  }
  get _w() {
    return this.width - this.marginTop - this.marginRight;
  }
  get _h() {
    return this.height - this.marginTop - this.marginBottom;
  }
  //element transform
  get skewX() {
    return this.skew.x;
  }
  set skewX(val) {
    this.skew.x = val;
  }
  get skewY() {
    return this.skew.y;
  }
  set skewY(val) {
    this.skew.y = val;
  }
  get scaleX() {
    return this.scale.x;
  }
  set scaleX(val) {
    this.scale.x = val;
  }
  get scaleY() {
    return this.scale.y;
  }
  set scaleY(val) {
    this.scale.y = val;
  }
  //element children
  get lastChild() {
    let children = this.container.children;
    return children.length ? children[children.length - 1] : null;
  }
  get firstChild() {
    let children = this.container.children;
    return children.length ? children[0] : null;
  }
  /**
   * 设置放缩的中心
   * @param {Number} x
   * @param {Number} y
   */
  setPivot(x, y) {
    this.x += this.width * x;
    this.y += this.height * y;
    this.pivot.set(this.width * x, this.height * y);
  }
  //设置超出容器不显示
  setOutRnage() {
    if (this.mask) {
      this.mask = null;
    }
    if (!this.masked) {
      this.masked = true;
    }
    let { width, height } = this;
    let graphic = new PIXI.Graphics();
    graphic.beginFill();
    graphic.drawRoundedRect(this.x, this.y, width, height, this.borderRadius);
    graphic.endFill();
    this.mask = graphic;
  }
  drawStyle() {
    if (!this.painter) {
      this.painter = new PIXI.Graphics();
      super.addChild(this.painter);
    }
    this.painter.clear();
    let style = sortStyle(this.curStyle);
    let attrs = Object.keys(style);
    for (let i = 0; i < attrs.length; i++) {
      try {
        let attr = attrs[i];
        if (attr === "backgroundColor") {
          this.painter.beginFill(style.backgroundColor);
          this.painter.drawRoundedRect(
            this._x,
            this._y,
            this.width - this.marginRight - this.marginLeft,
            this.height - this.marginTop - this.marginBottom,
            this.borderRadius
          );
          this.painter.endFill();
        }
        if (attr === "border") {
          let { borderWidth, borderColor } = style.border;
          this.painter.beginFill(0xffffff, 0);
          this.painter.lineStyle(borderWidth, borderColor, 1);
          this.painter.drawRoundedRect(
            this._x,
            this._y,
            this.width - this.marginRight - this.marginLeft,
            this.height - this.marginTop - this.marginBottom,
            this.borderRadius
          );
          this.painter.endFill();
        }
      } catch (err) {
        throw err;
      }
    }
  }
  //绘制背景图
  drawBackgroundImg() {
    if (!this.backgroundImage) {
      return;
    }
    this.bgImg = new Image({
      url: this.backgroundImage
    });
    this.bgImg.width = this.width;
    this.bgImg.height = this.height;
    this.addBackgroundImg(this.bgImg, 1);
    if (!this.clickBackgroundImage) {
      return;
    }
    this.clickBgImg = new Image({
      url: this.clickBackgroundImage
    });
    this.clickBgImg.width = this.width;
    this.clickBgImg.height = this.height;
    this.addBackgroundImg(this.clickBgImg, 2);
    this.clickBgImg.visible = false;
  }
  /*
  *添加背景图片到父元素中 **注意层级关系**
  */
  addBackgroundImg(bg, index) {
    bg.load(this, index);
  }
  addChild(child) {
    if (child.type === "image") {
      child.load(this.container, this.container.children.length);
    } else {
      if (this.lastChild) {
        child.x = this.lastChild.x;
        child.y = this.lastChild.y + this.lastChild.height;
      } else {
        child.x = 0;
        child.y = 0;
      }
      this.container.addChild(child);
    }
  }
  addListener(eventType, cb) {
    this.moving = false;
    if (eventType === "scroll") {
      this.scrollAble = true;
      let _y = 0;
      this.on("pointerdown", event => {
        this.moving = true;
        _y = event.data.getLocalPosition(this, {}, event.data.global).y;
      });
      this.on("pointermove", event => {
        if (this.moving) {
          let y = event.data.getLocalPosition(this, {}, event.data.global).y;
          if (this.container && this.container.height <= this.height) {
            return;
          } else if (
            this.container &&
            this.container.y + this.container.height <= this.height &&
            y - _y <= 0
          ) {
            console.log("到底啦");
            this.container.y = this.height - this.container.height;
            return;
          } else if (this.container && this.container.y >= 0 && y - _y >= 0) {
            console.log("到顶啦");
            this.container.y = 0;
            return;
          }
          this.container.y += y - _y;
          _y = y;
        }
      });
      this.on("pointerup", event => {
        this.moving = false;
      });
      this.on("pointerupoutside", event => {
        this.moving = false;
      });
    } else {
      this.on(eventType, cb);
    }
  }
  setMargin(top = 0, right = 0, bottom = 0, left = 0) {
    this.marginTop = top;
    this.marginRight = right;
    this.marginBottom = bottom;
    this.marginLeft = left;
    this.width += left + right;
    this.height += top + bottom;
    this.container.x += this.marginLeft;
    this.container.y += this.marginTop;
  }
}
class ListItem extends Element {
  constructor(options) {
    super(options);
    this.type = "list-item";
  }
}
class List extends Element {
  constructor(options) {
    super(options);
    this.type = "list";
  }
}
class Image extends PIXI.Sprite {
  constructor(options = {}) {
    if (!options.url) {
      throw new Error("url of image is not exist");
    }
    super();
    this.url = options.url;
    this.type = "image";
    this.style = options.style || {};
    this.initStyle();
    this.loader = new PIXI.loaders.Loader();
  }
  initStyle() {
    Object.keys(this.style).forEach(key => {
      this[key] = this.style[key];
    });
  }
  load(parentEle, index) {
    let url = this.url;
    if (_textureCache[url]) {
      this.texture = _textureCache[url];
      return;
    } else {
      this.loader.add(url).load(() => {
        if (_textureCache[url]) {
          this.texture = _textureCache[url];
        } else {
          this.texture = this.loader.resources[url].texture;
        }
      });
    }
    parentEle.addChildAt(this, index);
  }
}
class Button extends Element {
  constructor(options, text = "") {
    super(options);
    this.style = options.style || {};
    this.clickStyle = mixStyle(this.style, options.clickStyle || {});
    this.type = "button";
    this.text = text;
    this.drawText();
    this.pointer();
    // this.pivot = { x: this.width / 2, y: this.height / 2 };
    // this.anchor = {x: 0.5, y: 0.5};
    this.diffAnimation = getDiffAnimation(this.style, this.clickStyle);
    this.animating = false;
  }
  drawText() {
    if (!this.text) {
      return;
    }
    let fontStyle = sortStyle(this.style).font;
    this.textEle = new Text(this.text, fontStyle);
    this.addChild(this.textEle);
  }
  pointer() {
    this.addListener("pointerdown", event => {
      event.stopPropagation();
      this.curStyle = this.clickStyle;
      this.bgImg.visible = false;
      this.clickBgImg.visible = true;
      this.drawStyle();
      if (!this.animating) {
        this.startTask();
      }
    });
    this.addListener("pointerup", () => {
      this.curStyle = this.style;
      this.bgImg.visible = true;
      this.clickBgImg.visible = false;
      this.drawStyle();
      if (!this.animating) {
        this.endTask();
      }
    });
    this.addListener("pointerupoutside", () => {
      this.curStyle = this.style;
      this.drawStyle();
      if (!this.animating) {
        this.endTask();
      }
    });
  }
  /**
   * 启动一个开始动画task
   */
  startTask() {
    let self = this;
    let t = 0;
    let task = new Task({
      infinite: true,
      name: "button-start-animation-task",
      onTick() {
        self.scale.x = easeFuncs.quadEaseIn(1, 0.92, 300, t);
        self.scale.y = easeFuncs.quadEaseIn(1, 0.92, 300, t);
        if (t / 300 >= 1) {
          task.remove();
          return;
        }
        t += 30;
      },
      onRemove() {
        console.log(">> removed");
      }
    });
    task.start();
  }
  /**
   * 启动一个结束动画task
   */
  endTask() {
    let self = this;
    let t = 0;
    let task = new Task({
      infinite: true,
      name: "button-end-animation-task",
      onTick() {
        self.scale.x = easeFuncs.quadEaseIn(0.92, 1, 300, t);
        self.scale.y = easeFuncs.quadEaseIn(0.92, 1, 300, t);
        if (t / 300 >= 1) {
          task.remove();
          return;
        }
        t += 30;
      },
      onRemove() {
        console.log(">>>>> removed");
        self.animating = false;
      }
    });
    task.start();
  }
}
class Text extends PIXI.Text {
  constructor(text, style) {
    super(text, style);
    this.type = "text";
    this.task = null;
  }
}

class View extends Element {
  constructor(options) {
    super(options);
    this.actions = [];
    this.type = "view";
    this.acting = false;
    this.animating = false;
  }
  /**
   * 进行移动动画
   * @param {String} attr 变化的属性名称
   * @param {Number} start 开始状态
   * @param {Number} end 结束状态
   * @param {Number} totalTime 总时间
   * @param {String} animateFuc 缓动函数名称
   * @param {Boolean} infinite 是否循环
   * @param {Boolean} alternate 是否交替
   */
  moveAction(attr, start, end, totalTime, animateFuc, infinite, alternate) {
    let self = this;
    let t = 0;
    let direc = 1;
    let complete = 0;
    let d = totalTime;
    this.actions.push(function(dt) {
      //如果完成动画且infinite为false，结束动画
      if (complete) {
        return;
      }
      t = t + direc * dt;
      if (t > d) {
        t = d;
      } else if (t < 0) {
        t = 0;
      }
      self[attr] = easeFuncs[animateFuc](start, end, d, t);
      //如果设置了动画不循环且不交替
      if (!infinite && !alternate && t == d) {
        complete = 1;
        return;
      }
      //如果设置了动画循环且不交替
      if (infinite && !alternate && t == d) {
        t = 0;
        return;
      }
      //如果设置了动画不循环但交替
      if (!infinite && alternate) {
        if (t == d) {
          direc = -1;
        } else if (t == 0) {
          direc = 1;
          complete = 1;
        }
        return;
      }
      //如果设置了动画循环且交替
      if (infinite && alternate) {
        if (t == d) {
          direc = -1;
        } else if (t == 0) {
          direc = 1;
        }
      }
    });
  }
  startAction() {
    let self = this;
    if (self.task) {
      console.warn(
        "view already has a action which running, please stop this action"
      );
      return;
    }
    let last = +new Date();
    let now = last;
    self.actionTask = new Task({
      infinite: true,
      onTick() {
        now = +new Date();
        self.updateFrame(now - last);
        self.drawStyle();
        last = now;
      },
      onRemove() {}
    });
    self.actionTask.start();
  }
  stopAction() {
    this.actionTask.remove();
    this.actionTask = null;
  }
  updateFrame(dt) {
    for (var i = 0; i < this.actions.length; i++) {
      this.actions[i](dt);
    }
  }
  setKeyFrames(animation) {
    let d = (this.dur = animation.animationDuration);
    let interpolation = [];
    for (let i = 0; i < animation.keyframes.length - 1; i++) {
      let trace = {};
      trace.frames = [];
      trace.r = animation.keyframes[i + 1].percent * d;
      for (let k in animation.keyframes[i].state) {
        let interp = interFuncs[animation.animateTimingFunc](
          {
            x: animation.keyframes[i].percent,
            y: animation.keyframes[i].state[k]
          },
          {
            x: animation.keyframes[i + 1].percent,
            y: animation.keyframes[i + 1].state[k]
          },
          d *
            (animation.keyframes[i + 1].percent -
              animation.keyframes[i].percent),
          animation.controlPoints
        );
        trace.frames.push({
          k: k,
          f: interp
        });
      }
      interpolation.push(trace);
    }
    this.interpolation = interpolation;
  }
  animate() {
    if (this.animating) {
      console.warn('one animation is runing');
      return;
    }
    this.animating = true;
    if (!this.interpolation) {
      return;
    }
    let self = this;
    let start = +new Date();
    let now = start;
    let i = 0;
    let _d = 0;
    let l = self.interpolation.length;
    self.animationTask = new Task({
      infinite: true,
      name: "view-animation-task",
      onTick() {
        if (now - start > self.dur) {
          self.animationTask.remove();
          return;
        }
        if (i < l && now - start > self.interpolation[i].r) {
          if (now - start >= self.dur - 20) {
            now = start + self.dur;
          }
          _d = self.interpolation[i].r;
          i++;
        }
        for (let j = 0; j < self.interpolation[i].frames.length; j++) {
          let frame = self.interpolation[i].frames[j];
          self[frame.k] = frame.f(now - start - _d).y;
        }
        // self.skewX = self.interpolation[i].f(now - start - _d).y;
        if (now - start >= self.dur) {
          self.animationTask.remove();
        }
        now = +new Date();
      },
      onRemove() {
        self.animating = false;
        console.log(">> removed");
      }
    });
    self.animationTask.start();
    return this;
  }
  //动画结束回调
  animationend(cb) {
    this.animating = false;
    cb();
  }
  //停止动画
  stopAnimation() {
    this.animationTask.remove();
    this.animationTask = null;
  }
}

class Input extends Element {
  constructor(options) {
    super(options);
    this.inputEle = document.createElement("input");
  }
  set width(val) {
    super.width = val;
    this.inputEle.width = val;
  }
  set height(val) {
    super.width = val;
    this.inputEle.height = val;
  }
  init() {
    // this.input
  }
}

/**以下为公共方法**/

let easeFuncs = {
  linear(b, c, d, t) {
    return b + ((c - b) * t) / d;
  },
  quadEaseOut(b, c, d, t) {
    return (b - c) * (t / d - 1) * (t / d - 1) + c;
  },
  quadEaseIn(b, c, d, t) {
    return (c - b) * (t / d) * (t / d) + b;
  },
  quadEaseInOut(b, c, d, t) {
    if (t / (d / 2) < 1) {
      return ((c - b) / 2) * ((2 * t) / d) * ((2 * t) / d) + b;
    }
    return ((b - c) / 2) * (((2 * t) / d - 1) * ((2 * t) / d - 3) - 1) + b;
  },
  bounceEaseIn(b, c, d, t) {
    var t = t / d;
    if (t < 1 / 2.75) {
      return (c - b) * (7.5625 * t * t) + b;
    } else if (t < 2 / 2.75) {
      return (c - b) * (7.5625 * (t -= 1.5 / 2.75) * t + 0.75) + b;
    } else if (t < 2.5 / 2.75) {
      return (c - b) * (7.5625 * (t -= 2.25 / 2.75) * t + 0.9375) + b;
    } else {
      return (c - b) * (7.5625 * (t -= 2.625 / 2.75) * t + 0.984375) + b;
    }
  }
};
/**
 * 混合style1,styl2
 * @param {Object} style1
 * @param {Object} style2
 */
function mixStyle(style1, style2) {
  return Object.assign({}, style1, style2);
}
/**
 * 对style进行分类
 * @param {Object} style
 */
function sortStyle(style) {
  let sorted = {
    borderRadius: 0,
    border: {
      borderWidth: 0,
      borderColor: "0xffffff"
    },
    font: {
      fontFamily: "",
      fontColor: "0xffffff",
      fontSize: 16,
      fontWeight: 600
    }
  };
  for (let k in style) {
    switch (k) {
      case "backgroundColor":
        sorted.backgroundColor = style[k];
        break;
      case "backgroundImage":
        sorted.backgroundImage = style[k];
        break;
      case "borderRadius":
        sorted.borderRadius = style[k];
        break;
      case "borderWidth":
        sorted.border.borderWidth = style[k];
        break;
      case "borderColor":
        sorted.border.borderColor = style[k];
        break;
      case "fontFamily":
        sorted.font.fontFamily = style[k];
        break;
      case "fontColor":
        sorted.font.fill = style[k];
        break;
      case "fontSize":
        sorted.font.fontSize = style[k];
        break;
      case "dropShadow":
        sorted.font.dropShadow = style[k];
        break;
      case "dropShadowAlpha":
        sorted.font.dropShadowAlpha = style[k];
        break;
      case "fontWeight":
        sorted.font.fontWeight = style[k];
        break;
      case "dropShadowAngle":
        sorted.font.dropShadowAngle = style[k];
        break;
      case "dropShadowColor":
        sorted.font.dropShadowColor = style[k];
        break;
      case "stroke":
        sorted.font.stroke = style[k];
        break;
      case "strokeThickness":
        sorted.font.strokeThickness = style[k];
        break;
      case "lineJoin":
        sorted.font.lineJoin = style[k];
        break;
    }
  }
  return sorted;
}
/**
 * 计算需要变化的属性的差
 * 目前只计算backgroundColor和borderColor
 * @param {Object} style1
 * @param {Object} style2
 */
function getDiffAnimation(style1, style2) {
  let diff = {};
  diff.backgroundColor = [];
  diff.backgroundColor.push(style1.backgroundColor);
  diff.backgroundColor.push(style2.backgroundColor);

  diff.borderColor = [];
  diff.borderColor.push(style1.borderColor);
  diff.borderColor.push(style2.borderColor);

  return diff;
}
const interFuncs = {
  linear(b, c, d) {
    let x1 = b.x;
    let y1 = b.y;
    let x2 = c.x;
    let y2 = c.y;
    return function linear(t) {
      t = t / d;
      let frame = { x: x1, y: y1 };
      frame.x = x1 + (x2 - x1) * t;
      frame.y = y1 + (y2 - y1) * t;
      return frame;
    };
  },
  quadEaseOut(b, c, d) {
    let x1 = b.x;
    let y1 = b.y;
    let x2 = c.x;
    let y2 = c.y;
    return function quadEaseOut(t) {
      t = t / d;
      let frame = { x: x1, y: y1 };
      frame.x = (x1 - x2) * (t - 1) * (t - 1) + x2;
      frame.y = (y1 - y2) * (t - 1) * (t - 1) + y2;
      return frame;
    };
  },
  quadEaseIn(b, c, d) {
    let x1 = b.x;
    let y1 = b.y;
    let x2 = c.x;
    let y2 = c.y;
    return function quadEaseIn(t) {
      t = t / d;
      let frame = { x: x1, y: y1 };
      frame.x = (x2 - x1) * t * t + x1;
      frame.y = (y2 - y1) * t * t + y1;
      return frame;
    };
  },
  bounceEaseIn(b, c, d) {
    let x1 = b.x;
    let y1 = b.y;
    let x2 = c.x;
    let y2 = c.y;
    return function bounceEaseIn(t) {
      t = t / d;
      let frame = { x: x1, y: y1 };
      if (t < 1 / 2.75) {
        frame.x = (x2 - x1) * (7.5625 * t * t) + x1;
        frame.y = (y2 - y1) * (7.5625 * t * t) + y1;
        return frame;
      } else if (t < 2 / 2.75) {
        t -= 1.5 / 2.75;
        frame.x = (x2 - x1) * (7.5625 * t * t + 0.75) + x1;
        frame.y = (y2 - y1) * (7.5625 * t * t + 0.75) + y1;
        return frame;
      } else if (t < 2.5 / 2.75) {
        t -= 2.25 / 2.75
        frame.x = (x2 - x1) * (7.5625 * t * t + 0.9375) + x1;
        frame.y = (y2 - y1) * (7.5625 * t * t + 0.9375) + y1;
        return frame;
      } else {
        t -= 2.625 / 2.75;
        frame.x = (x2 - x1) * (7.5625 * t * t + 0.984375) + x1;
        frame.y = (y2 - y1) * (7.5625 * t * t + 0.984375) + y1;
        console.log(frame.y)
        return frame;
      }
    }
    
  },
  /**
   * 生成贝塞尔曲线
   * @param {Object} b 起始状态
   * @param {Object} c 结束状态
   * @param {Number} d 经历时间
   * @param {Array} points 控制点
   */
  bezier(b, c, d, points) {
    if (!Array.isArray(points) || points.length !== 4) {
      throw new Error("points must be array and length is 4");
    }
    let [x1, y1, x2, y2] = points;
    //控制点1
    let cx1 = b.x + (c.x - b.x) * x1;
    let cy1 = b.y + (c.y - b.y) * y1;
    //控制点2
    let cx2 = b.x + (c.x - b.x) * x2;
    let cy2 = b.y + (c.y - b.y) * y2;
    return function bazier(t) {
      t = t / d;
      let frame = { x: x1, y: y1 };
      frame.x =
        b.x * Math.pow(1 - t, 3) +
        3 * cx1 * t * Math.pow(1 - t, 2) +
        3 * cx2 * t * t * (1 - t) +
        c.x * Math.pow(t, 3);
      frame.y =
        b.y * Math.pow(1 - t, 3) +
        3 * cy1 * t * Math.pow(1 - t, 2) +
        3 * cy2 * t * t * (1 - t) +
        c.y * Math.pow(t, 3);
      return frame;
    };
  }
};
/**
 * TODO 增加对矩阵的支持
 * matrix(skewX, skewY, scaleX, scaleY, tx, ty)
 */
/**
 * 解析矩阵，矩阵 => 四元数
 * @param {Array} matrix 
 */
function parseMatrix(matrix) {
  if (Array.isArray(matrix)) {
    throw new Error('matrix must be a array');
  }
}
export default { Element, ListItem, List, Text, Image, Button, View };
