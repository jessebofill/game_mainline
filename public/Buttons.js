class ButtonMan {
  constructor(
    nButtons,
    columns,
    rows,
    buttonW,
    buttonH,
    gridX = 0,
    gridY = 0,
    gridW = width,
    gridH = height
  ) {
    if (nButtons > rows * columns) {
      console.warn(
        "warning: " +
          nButtons +
          " buttons is more than can fit in specified grid. Only " +
          rows * columns +
          " buttons were created."
      );
    }
    let i = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < columns && i < nButtons; c++, i++) {
        let label = "button" + i;
        let spacingX = (gridW - columns * buttonW) / (columns + 1);
        let spacingY = (gridH - rows * buttonH) / (rows + 1);
        let buttonX = gridX + spacingX + c * (spacingX + buttonW);
        let buttonY = gridY + spacingY + r * (spacingY + buttonH);
        this[label] = new Button(buttonX, buttonY, buttonW, buttonH, label);
      }
    }

    this.x = gridX;
    this.y = gridY;
    this.w = gridW;
    this.h = gridH;
  }

  liveAssignStop() {
    for (let button in this) {
      if (this[button] instanceof Button) {
        this[button].liveAssignState = false;
      }
    }
  }

  liveAssign() {
    for (let button in this) {
      if (this[button] instanceof Button) {
        this[button].liveAssignState = true;
      }
    }
  }

  // setLabel(button, label) {
  //   this[button].label = label;
  // }

  rename(oldKey, newKey, newLabel) {
    if (this[newKey]) {
      console.warn('warning: "' + newKey + '" is an already existing Button.');
    } else {
      delete Object.assign(this, { [newKey]: this[oldKey] })[oldKey];
      if (newLabel) this[newKey].label = newLabel;
      else this[newKey].label = newKey;
    }
  }
  showBound() {
    noFill();
    rect(this.x, this.y, this.w, this.h);
  }

  buttonWarning(x) {
    console.warn('warning: "' + x + '" is not a Button object.');
  }
  propertyWarning(x) {
    console.warn('warning: "' + x + '" is not a property of Button objects.');
  }

  //setShowType()

  setProperty(prop, value, ...buttons) {
    //if 'all' is passed as 3rd arg copy to all buttons
    if (buttons[0] === "all") {
      buttons = [];
      for (let currentButton in this) {
        if (this[currentButton] instanceof Button) buttons.push(currentButton);
      }
    }

    for (let currentButton of buttons) {
      if (this[currentButton]) {
        if (this[currentButton][prop] !== undefined)
          this[currentButton][prop] = value;
        else {
          //log warning if property was given that doesn't exist
          this.propertyWarning(prop);
          break;
        }

        //if button to apply properties to doesn't exist, log warning
      } else this.buttonWarning(currentButton);
    }
  }

  //takes 3 or more args
  //1st arg is property name you want to copy as a string or multiple properties as an array of strings
  //2nd arg is button object to copy from as string
  //3rd args and so on are the buttons to copy to given as string
  //each button to copy to is given as separate arg
  copyProperties(listOfProperties, fromButton, ...toButtons) {
    if (this[fromButton]) {
      //if 'all' is passed as 3rd arg copy to all buttons
      if (toButtons[0] === "all") {
        toButtons = [];
        for (let currentButton in this) {
          if (this[currentButton] instanceof Button)
            toButtons.push(currentButton);
        }
      }

      for (let currentButton of toButtons) {
        if (this[currentButton]) {
          if (fromButton != currentButton) {
            //copy all properties if 'all' is given as first arg
            if (listOfProperties === "all") {
              for (let prop in this[currentButton]) {
                //do not copy x/y coordinates, button label, or button subscribers when copying all
                if (prop != "x" && prop != "y" && prop != "label" && prop != "subscribers") {
                  this[currentButton][prop] = this[fromButton][prop];
                }
              }
            } else {
              //if 1st arg is single property and not array put it into an array
              //then iterate through it applying each property listed
              if (listOfProperties.constructor !== Array)
                listOfProperties = [listOfProperties];
              for (let prop of listOfProperties) {
                if (this[fromButton][prop] !== undefined) {
                  this[currentButton][prop] = this[fromButton][prop];
                  
                  //log warning if a property was given that doesn't exist
                } else this.propertyWarning(prop);
              }
            }
          }

          //if button to copy to doesn't exist, log warning
        } else this.buttonWarning(currentButton);
      }

      //if button to copy from doesn't exist, log warning
    } else this.buttonWarning(fromButton);
  }

  show(type) {
    for (let each in this) {
      if (this[each] instanceof Button) this[each].show(type);
    }
  }
   onClickAny(f, ...args) {
     for (let each in this) {
       if (this[each] instanceof Button) this[each].onClick(f, ...args);
     }
   }
}

class Button {
  constructor(x, y, w, h, label) {
    this.label = label;
    this.x = x;
    this.y = y;
    this.width = w;
    this.height = h;
    this.subscribers = [];
    this.args = {};

    //default settings for visibility and display
    this.visibility = "all";
    this.textStyle = NORMAL;
    this.textSize = 20;
    this.font = "sans-serif";
    this.textAlign = CENTER;
    this.xTextOffset = 0
    this.yTextOffset = 0
    this.borderWeight = 2;
    this.textColor = color(50, 55, 70);
    this.borderColor = color(50, 55, 70);
    this.depressedColor = color(100, 105, 115);
    this.depressedTextColor = color(175, 185, 185);
    this.color = color(160, 165, 170);
    this.highlightColor = color(125, 130, 135);
    this.highlight = true;
    this.highlightOnDepress = true;

    //button status variables
    this.latched = false
    this.active = true;
    this.depressed = false;
    this.clickInitiated = false;
    this.liveAssignState = false;

    let thisButton = this;
    document.addEventListener("click", function () {
      if (
        thisButton.active &&
        thisButton.containsMouse() &&
        thisButton.clickInitiated
      ) {
        thisButton.sendEvent();
      }
    });
    document.addEventListener("mousedown", function () {
      if (thisButton.active && thisButton.containsMouse()) {
        thisButton.clickInitiated = true;
      } else thisButton.clickInitiated = false;
    });
  }

  drawRect() {
    rectMode(CORNER);
    if (this.highlight && this.containsMouse() && this.active) fill(this.highlightColor);
    if ((this.depressed && this.highlightOnDepress) || this.latched) fill(this.depressedColor);
    rect(this.x, this.y, this.width, this.height);

  }

  showText() {
    
    if ((this.depressed && this.highlightOnDepress) || this.latched) {
      fill(this.depressedTextColor);
    } else {
      fill(this.textColor);
    }
    
    //use objects text settings and display the text
    noStroke();
    textSize(this.textSize);
    textFont(this.font);
    textStyle(this.textStyle);
    textAlign(this.textAlign, CENTER);
    text(this.label, this.x + this.xTextOffset, this.height / 2 + this.y + this.yTextOffset, this.width);
    
  }

  //call this method to define what happens when button is clicked
  //takes a function as first argument
  //all remaining arguments given will be the arguments to be used w/ that function
  //you can call this again with the same function in order to change its assosciated arguments
  onClick(fn, ...fArgs) {                                                                                                            
    if (fn instanceof Function) {
      //this will be used to set the .displayName of the function
      let name;

      if (fn.name) {
        name = fn.name;
      }

      //if the function is anonymous create a name for it using the next available
      //it will be in the form of "f0", "f1", "f2"...
      else {
        let current = this;

        let recurse = function (i) {
          let nextName = "f" + i;
          if (!current.args[nextName]) {
            return i;
          }
          return recurse(i + 1);
        };

        name = "f" + recurse(0);
      }

      //this checks if the function has previously been subscribed
      //and subscribes it if it hasn't
      if (!this.args[name]) {
        //.displayName is a property of functions in javascript
        //for each subscriber function set the .displayName property
        fn.displayName = name;

        //store the function in the .subscribers array
        this.subscribers.push(fn);
      }

      //use the .displayName to create a property w/ that name (if it hasn't yet been subbed) in the .args object
      //and store an array of arguments to be associated w/ that function
      this.args[name] = fArgs;

      /*
      ADD CODE HERE TO BE ABLE TO PASS REFERENCES TO VARIABLES AND
      STORE THOSE AS THE ARGUMENTS
      */

      //see sendEvent to see how the functions are called w/ arguments
    }
  }

  show(visibility = this.visibility) {
    push() //save p5 renderer state
    
    strokeWeight(this.borderWeight);
    if (mouseIsPressed && this.clickInitiated) {
      this.depressed = true;
    } else this.depressed = false;

    switch (visibility) {
      case "invisible":
        noStroke();
        noFill();
        this.drawRect();
        break;

      case "borderOnly":
        noFill();
        stroke(this.borderColor);
        this.drawRect();
        break;

      case "textOnly":
        noStroke();
        noFill();
        this.drawRect();
        this.showText();
        break;

      case "fillOnly":
        noStroke();
        fill(this.color);
        this.drawRect();
        break;

      case "noBorder":
        noStroke();
        fill(this.color);
        this.drawRect();
        this.showText();
        break;

      case "noText":
        stroke(this.borderColor);
        fill(this.color);
        this.drawRect();
        break;

      case "transparent":
        stroke(this.borderColor);
        noFill();
        this.drawRect();
        this.showText();
        break;

      case "all":
        stroke(this.borderColor);
        fill(this.color);
        this.drawRect();
        this.showText();
    }      
    pop() //restore p5 renderer state
    
  }

  containsMouse() {
    if (
      mouseX > this.x &&
      mouseX < this.x + this.width &&
      mouseY > this.y &&
      mouseY < this.y + this.height
    )
      return true;
    return false;
  }

  liveAssign() {
    this.liveAssignState = true;
  }

  liveAssignStop() {
    this.liveAssignState = false;
  }

  sendEvent() {
    if (this.liveAssignState) {
      let liveSub = prompt("subscribe a function to this button");
      this.onClick(window[liveSub]);
    } else {
      //call each function in the .subscribers array
      //the .displayName property of the function is used to look up
      //the associated argmunents which are stored in the .args object
      //each function is called in the order that they are added
      for (let each of this.subscribers) {
        each(...this.args[each.displayName]);
      }
    }
  }
}