function Tick_Tock_Timer(){
	var tick_time = null;
	var tock_time = null;
	var reference_time = null;
	var pause_time = null;
	var started = false;
	var paused = false;
	this.startTimer = function(){
		if(started) {
			alert("already started");
			return false;
		}
		reference_time = (new Date()).getTime();
		started = true;
		pause_time = reference_time ;
	};
	
	this.pauseTimer = function(){
		if(!started) {
			alert("Click Start First");
			return false;
		}
		if(paused) {
			alert("Already Paused");
			return false;
		}
		pause_time = (new Date()).getTime();
		paused = true;
	};
	
	this.resumeTimer = function(){
	
		if(!paused) {
			alert("Not in Pause Mode");
			return false;
		}
		var sleeptime = (new Date()).getTime() - pause_time;
		reference_time = reference_time + sleeptime;
		paused = false;
	};
	
	this.stopTimer = function(){
		paused = false;
		started = false;
	};
	
	this.tick = function(){
		//tick_time = (new Date()).getTime() - reference_time;
		tick_time = this.getCurrentTime();
	};
	this.tock = function(){
		//tock_time = (new Date()).getTime() - reference_time;
		tock_time = this.getCurrentTime();
	};
	
	this.getCurrentTime = function(){
		if(!started){
			return 0;
		}
		if(!paused){
			return (new Date()).getTime() - reference_time;
		}else{
			return pause_time - reference_time;
		}
	};
	
	this.getTickTime = function(){
		return tick_time;
	};

	this.getTockTime = function(){
		return tock_time;
	
	};
	
	this.getTickTockDiff = function(){
		return tick_time - tock_time;
	};
	
	this.is_paused = function(){
		return paused;
	}
	this.is_started = function(){
		return started;
	}
	
}//end of function

function Animator_Class(){
	this.TID = null ;
	this.funvar = null;
	this.interval = null;
	this.reference_time = null;


	this.reference_timer = function(){
		this.TID = window.setTimeout(this.funvar , this.interval);
		this.reference_time = (new Date()).getTime();
	};


	this.pause_timer = function(){
		var curr_time = (new Date()).getTime();
		var elapsed_time = curr_time - this.reference_time ;
		this.interval = this.interval - elapsed_time;
		window.clearTimeout(this.TID);
	};

	this.setTimeout = function(funvar, interval){
		this.funvar = funvar;
		this.interval = interval;
		this.TID = window.setTimeout(funvar,interval);
		this.reference_time = (new Date()).getTime();
	};
	this.clearTimeout = function(){
		window.clearTimeout(this.TID);
	};

}

