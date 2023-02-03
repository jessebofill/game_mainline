//this class is designed to animate any property of an object that is a number type
//multiple properties can be animated by in one animation, e.g. x,y values of an object
//it is also possible to use it on elements in array, syntax is the same. just use the arrays index in place of objects property
class Animation {
  //the constructor only takes 2 args by default
  //1st is the object (or array) whose properties you want to animate 
  //2nd is a "frame object" that defines the animation
  // *see "FRAME OBJECT description" for syntax of frame object
  //3rd argument is optional. use the string 'abs' to use absolute mode
  constructor(obj, frameObj, isAbs) {
    
    //curves object contains the curve fn's that can be chosen for interpolation for the animation or keyframes
    // *see "INTERPOLATION options" for deatils of use and syntax to define own fn
    this.curves = {
      linear: function (currentX, totalX) {
        return currentX / totalX;
      },

      expo1: function (currentX, totalX) {
        return Math.pow(currentX / totalX, 2);
      },

      expo2: function (currentX, totalX) {
        return Math.pow(currentX / totalX, 3);
      },

      expo3: function (currentX, totalX) {
        return Math.pow(currentX / totalX, 4);
      },
    };

    this.running = false;         //global animation property flag, starts/stops the animation
    this.ready = true;            //global animation property flag indicating whether animation is ready to be played
    this.isAbs = (isAbs === 'abs') ? true : false
                                  // global flag whether to use absolute mode or not
    
    this.animationFrame = 0;      //global animation property, tracks current animation frame#
    this.animationDuration = 0;   //global animation property, 
                                  //how many frames animation lasts (this is set below depeneding on last keyframe)
    
    this.object = obj;            //reference to the object of the properties being animated
 
    //this object stores details for each property being animated
    //information such as values for frames and flags
    this.animatedProps = {};            
    for (let prop in frameObj) {
     
      //check if multiple 'keyframes' were defined or just one
      if (!(frameObj[prop][0] instanceof Array)) frameObj[prop] = [frameObj[prop]];
      
      //check if property listed exists in specified object.....
      if (obj[prop] !== undefined) {            
        this.animatedProps[prop] = {
          atKey: [],             //val at keyframe defined in frame object, these will be used to calculate other values depending on mode
          deltaPrevKeyToKey: [], //delta for each keyframe, index represents keyframe #, defined by frame object or calc from abs values
          deltaStartToFrame: [], //delta from start for each animation frame
          range: [],             //min/max boundaries user can define for the animated properies, min: index 0, max: index 1
          frameAtKey: [],        //defines what frame # each keyframe will be at, index represents keyframe #, defined by frame object
          absAtFrame: [],        //calculated absolute value for the animated property at each frame #, index represents frame #
          curveType: [],         //curve type to use for each keyframe, index represents keyframe #, defined by frame object
          asPercent: false,      //flag
          duration: frameObj[prop][frameObj[prop].length - 1][1],
        };       

        //for each keyframe of the specific animated property...
        for (let each of frameObj[prop]) {
          this.animatedProps[prop].atKey.push(each[0]);             //...push the first element into atKey array
          this.animatedProps[prop].deltaPrevKeyToKey.push(each[0]); //as well as deltaPrevKeyToKey array
          
          this.animatedProps[prop].frameAtKey.push(each[1]);        //...push the second element into frameAtKey array

          let curve = each[2];                                      //get third element which represents curve type
          if (!this.curves[curve.name] && curve.name)               //check if it's a default curve or one that's already been given
            curve = this.makeCustomCurve(curve);                    //if not then add it to curve dictionary
          this.animatedProps[prop].curveType.push(curve);           //...push reference into curveType array
        }
        
      } else {
        // .....if property listed does not exist in specified object log a warning
        console.warn(
          "warning: " +
            prop +
            " is not a property of the specified object. Check object or property name."
        );
      }
      
      //determine animation duration by finding whichever property had a keyframe at the highest frame #
      this.animationDuration = this.animatedProps[prop].duration > this.animationDuration ? this.animatedProps[prop].duration : this.animationDuration;
    }
    
    //do initial frame value calculations
    this.calculateValues();
  }


  //this method must be added to draw loop to ready the animation
  animate() {
    if (this.running) {           //when running flag is set to true the animation will begin
      
      //guard clause, when animation frame gets to end the animation has completed
      if (this.animationFrame === this.animationDuration) {this.finish(); return }
      
      //the animation frame # will begin counting up (until it reaches specified duration or bounds are met) 
      this.animationFrame++;
      let frame = this.animationFrame - 1               //subtract 1 from animation frame # to use as index into arrays
      let absVal
      
      for (let prop in this.animatedProps) {
        if(frame < this.animatedProps[prop].duration){  //check duartion of this animated property, if frame # exceeds it skip
                 
          if(this.isAbs) absVal = this.animatedProps[prop].absAtFrame[frame]        //if abs mode is set use precalculated value 
          //otherwise calculate absolute value by getting delta between frame and adding it to the properties current value
          else {
            let deltaStartToPrevFrame = frame > 0 ?  this.animatedProps[prop].deltaStartToFrame[frame - 1] : 0
            let deltaPrevFrameToFrame = this.add(this.animatedProps[prop].deltaStartToFrame[frame], -deltaStartToPrevFrame)
            absVal = this.add(this.object[prop], deltaPrevFrameToFrame);
          }
          
          let limit = this.checkLimit(absVal);          //check if absolute value will go past the user defined min/ max
          
          //set the property to the value for that frame
          //unless it will pass limit, then use limit and stop the animation early
          this.object[prop] = limit !== undefined ? limit : absVal;
          if (limit !== undefined) this.finish();
        }
      }    
    }
  }
  
  
  //this method calculates absolute values for each frame from the starting frame up to the 1st keyframe
  //the absolute/ relative values for all other keyframes only need to be calculated once with this.calculateValues()
  //only the first keyframe needs to be recaluculated each time the animation starts or once if .startAt() is used
  calcAbs1stKey(){
    for (let prop in this.animatedProps){
      let frame = 0
      //start from properties current value or user defined starting value
      let start = this.animatedProps[prop].startAt ? this.animatedProps[prop].startAt : this.object[prop]
      let duration = this.animatedProps[prop].frameAtKey[0]    //duration of keyframe
      let deltaStartToPrevFrame = 0
      
      //calculate and rewrite delta of first keyframe 
      this.animatedProps[prop].deltaPrevKeyToKey[0] = this.animatedProps[prop].atKey[0] - start
      let deltaStartTo1stKey = this.animatedProps[prop].deltaPrevKeyToKey[0]
        
      //loop through each frame of first keyframe
      for (let frameOfKey = 0; frameOfKey < duration; frameOfKey++) {
        
        //calculate the animated property delta of keyframe frame # using the associated interpolation fn      
        let deltaStartToFrame =            
          this.curves[this.animatedProps[prop].curveType[0]](frameOfKey + 1, duration) * deltaStartTo1stKey;
          
        //store animated property absolute value for current frame 
        //as the delta from start plus where it started    
        this.animatedProps[prop].absAtFrame[frame] = this.add(deltaStartToFrame, start);
          
        deltaStartToPrevFrame = deltaStartToFrame       //this iterations frame value is used as prev frames value for next iteration
        frame++;                                        //increment frame #
      }
    }    
  }
  
    
  //this method calculates the delta values relative to the starting value for each frame
  calculateValues() {
    for (let prop in this.animatedProps) {
      let frame = 0;
      let frameAtPrevKey = 0;
      let deltaStartToPrevKey = 0
      let delta1stKeyToKey = 0

      //loop through each keyframe
      for (let keyframe = 0;keyframe < this.animatedProps[prop].frameAtKey.length; keyframe++) {
        let deltaPrevKeyToPrevFrame = 0
        
        //if absolute mode is set rewrite the delta at key values using the difference between absolute values
        if(this.isAbs) this.animatedProps[prop].deltaPrevKeyToKey[keyframe] = this.add(this.animatedProps[prop].atKey[keyframe], -this.animatedProps[prop].atKey[keyframe-1])

        let duration = this.animatedProps[prop].frameAtKey[keyframe] - frameAtPrevKey;     //calculate duration of the keyframe 
        
        if(duration <= 0){              //if the keyframe isn't at a later frame # than the previous keyframe, log an error    
          console.error('keyframe at frame ' + this.animatedProps[prop].frameAtKey[keyframe] + 
                        ' cannot be before frame ' + frameAtPrevKey)
        }
      
        //loop through each frame in the current keyframe
        for (let frameOfKey = 0; frameOfKey < duration; frameOfKey++) {
          
          let deltaPrevKeyToFrame =     //calculate the animated property delta of keyframe frame # using the associated interpolation fn
            this.curves[this.animatedProps[prop].curveType[keyframe]](frameOfKey + 1, duration) * this.animatedProps[prop].deltaPrevKeyToKey[keyframe];
          
          //store animated property delta at the current frame relative to the start if in default mode
          //or store absolute value for current frame if in absolute mode      
          if (!this.isAbs) this.animatedProps[prop].deltaStartToFrame[frame] = this.add(deltaPrevKeyToFrame, deltaStartToPrevKey);  
          else this.animatedProps[prop].absAtFrame[frame] = this.add(deltaPrevKeyToFrame, this.animatedProps[prop].atKey[keyframe-1]);         
          
          frame++;                      //increment frame number
        }
        
        //update previous keyframe frame # as current keyframe frame # for next keyframe iteration
        frameAtPrevKey = this.animatedProps[prop].frameAtKey[keyframe];
        
        //update animated property delta from start to previous keyframe 
        deltaStartToPrevKey = this.add(deltaStartToPrevKey, this.animatedProps[prop].deltaPrevKeyToKey[keyframe])
      }
    }
  }  
  
  
  //this method defines the keyframe values as a percentage of the value passed to this method
  asPercent(tDelta){
    if(this.isAbs){      //cannot use asPercent mode and absolute mode at same time
      console.error('this animation cannot use percent mode. absolute mode is being used.')
      return
    }
      
    //total delta is how much the animated property will change over whole animation
    let totalDelta;
    
    for (let prop in this.animatedProps){
      
      //check if the argument was a single number or object
      //if single number was given it will be used for all properties that are being animated
      //otherwise user should pass an object with the same properties 
      //as those being animated and define a delta for each indiviually
      if (typeof tDelta === "number") totalDelta = tDelta;
      if (tDelta.hasOwnProperty(prop)) totalDelta = tDelta[prop];
       
      //calculate the key deltas from the percentages
      for (let i = 0; i < this.animatedProps[prop].deltaPrevKeyToKey.length; i++){
        this.animatedProps[prop].deltaPrevKeyToKey[i] =  (totalDelta / 100) * this.animatedProps[prop].atKey[i]
      }
      
      //recalculate the values
      this.calculateValues() 
    }  
  }
  
  //this method allows user to define the absolute value the animated property should start at
  //if this is not called the animated property will start at whatever it's current value is
  startAt(val) {
    let newStart;
    for (let prop in this.animatedProps) {
       
      //check if the argument was a single number or object
      //if single number was given it will be used for all properties that are being animated
      //otherwise user should pass an object with the same properties 
      //as those being animated and define the start value for each indiviually
      if (typeof val === "number") newStart = val;
      if (val.hasOwnProperty(prop)) newStart = val[prop];
      this.animatedProps[prop].startAt = newStart;
      
      //caluclate absolute values for 1st keyframe if absolute mode is set
      if (this.isAbs) this.calcAbs1stKey() 
    }
  }
    
  
  //this method begins the animation
  //this method returns a promise which user can chain with .then() and pass a callback to be executed upon animation completion
  play = () => {
    if(!this.running) {                           //check if animations is already running   
      
      for (let prop in this.animatedProps) {
        //check if start at value has been defined...
        //...if not and absolute mode has also been set, calculate absolute value for first keyframe
        if(this.animatedProps[prop].startAt == undefined){if(this.isAbs) this.calcAbs1stKey()} 
        else this.object[prop] = this.animatedProps[prop].startAt; //...if it has then set the animated property value to the start value
      }
      //set running flag to begin animating in draw loop
      this.running = true;
    }
    let thisObj = this;
    return new Promise(function(resolve,reject){       //return promise 
      thisObj.onFinish = resolve
    })   
  }
  
  
  //method to cancel animation early
  cancel = () => {
    this.running = false;
    this.reset();
  }
  

  //resets animation for next play
  reset() {
    this.animationFrame = 0;
  }
  
  
  //stops animation, resets, and calls user defined animation completion callback
  finish() {
    this.running = false;
    this.reset();
    this.onFinish();
  }
    
  
  //checks if the animated property value will go beyond the user specified boundaries
  checkLimit(val) {
    for (let prop in this.animatedProps) {
      if (val <= this.animatedProps[prop].range[0]) return this.animatedProps[prop].range[0];
      if (val >= this.animatedProps[prop].range[1]) return this.animatedProps[prop].range[1];
    }
  }  
  
  
  //formats and stores user defined interpolation function to be used later
  makeCustomCurve(interpFn) {
    this.curves[interpFn.name] = function (currentX, totalX) {
      let normalizedX = currentX / totalX;
      return interpFn(normalizedX);
    };
    return interpFn.name;
  }
    
  
  //custom addition method to prevent rounding errors
  add(...a){
    return parseFloat((a.reduce((x, y) => x + y * 1000000, 0)/1000000).toFixed(7))
  }   
    
}
