var solving=false;
		//ações
		var actionUP=0;
		var actionDOWN=1;
		var actionLEFT=2;
		var actionRIGHT=3;
        
		//embaralhar o tabuleiro
		function shuffle(){
			if(!solving){
				$('.p').sort(function(a,b){return $(a).attr('id')-$(b).attr('id')}).appendTo('#board');
				var board=[[0,1,2],[3,4,5],[6,7,8]];
				var r=0;
				var c=0;
				for(var i=0; i<40; i++){
					switch(Math.floor(Math.random()*4)){
						case actionUP:
							if(r==0) continue;
							board[r][c]=board[r-1][c];
							board[r-1][c]=0;
							swapNodes(board[r][c],board[r-1][c]);
							r=r-1;
							break;
						case actionDOWN:
							if(r==2) continue;
							board[r][c]=board[r+1][c];
							board[r+1][c]=0;
							swapNodes(board[r][c],board[r+1][c]);
							r=r+1;
							break;
						case actionLEFT:
							if(c==0) continue;
							board[r][c]=board[r][c-1];
							board[r][c-1]=0;
							swapNodes(board[r][c],board[r][c-1]);
							c=c-1;
							break;
						case actionRIGHT:
							if(c==2) continue;
							board[r][c]=board[r][c+1];
							board[r][c+1]=0;
							swapNodes(board[r][c],board[r][c+1]);
							c=c+1;
					}
				}
			}
		}

		//troque dois nós com id a e id b
		function swapNodes(a, b) {
			a = $('#'+a).get(0);
			b = $('#'+b).get(0)
			var aparent= a.parentNode;
			var asibling= a.nextSibling===b? a : a.nextSibling;
			b.parentNode.insertBefore(a, b);
			aparent.insertBefore(b, asibling);
		}

		//nó
		function Node(state, parent, action, depth){
		   this.state = state;
		   this.parent = parent;
		   this.action = action;
		   this.depth = depth;
		}

		//estratégia
		function selectNode(queue){
			while(true){
				if(queue.isEmpty()){
					return null;
				}
				var n = queue.dequeue();
				if(n.depth>=40){
					console.log("depth cutoff");
					continue;
				}
				return n;
			}
		}

		//Estado
		function State(copy){
			this.board=[[0,0,0],[0,0,0],[0,0,0]];
			this.r=0;
			this.c=0;
			this.delta=-1;
			if(copy==null){
				var state=this;
				var idx=0;
				$('.p').each(function(){
					var i=parseInt(idx/3);
					var j=idx%3;
					state.board[i][j]=parseInt($(this).attr('id'));
					if(state.board[i][j]==0){
						state.r=i;
						state.c=j;
					}
					idx++;
				});
			}else{
				for(var i=0; i<3; i++){
					for(var j=0; j<3; j++){
						this.board[i][j]=copy.board[i][j];
					}
				}
				this.r=copy.r;
				this.c=copy.c;
			}
		}

		//delta do estado objetivo
		State.prototype.getDelta=function(){
			if(this.delta>=0) return this.delta;
			this.delta=0;
			for(var i=0; i<3; i++){
				for(var j=0; j<3; j++){
					if(this.board[i][j]!=i*3+j){
						this.delta+=1+i+j;
					}
				}
			}
			return this.delta;
		}

		//Adicione métodos como este. Todos os objetos Person poderão invocar isso
		State.prototype.apply=function(a){
			switch(a){
				case actionUP:
					if(this.r==0) return null;
					break;
				case actionDOWN:
					if(this.r==2) return null;
					break;
				case actionLEFT:
					if(this.c==0) return null;
					break;
				case actionRIGHT:
					if(this.c==2) return null;
			}
			var s = new State(this);
			switch(a){
				case actionUP:
					s.board[this.r][this.c]=s.board[this.r-1][this.c];
					s.board[this.r-1][this.c]=0;
					s.r=this.r-1;
					break;
				case actionDOWN:
					s.board[this.r][this.c]=s.board[this.r+1][this.c];
					s.board[this.r+1][this.c]=0;
					s.r=this.r+1;
					break;
				case actionLEFT:
					s.board[this.r][this.c]=s.board[this.r][this.c-1];
					s.board[this.r][this.c-1]=0;
					s.c=this.c-1;
					break;
				case actionRIGHT:
					s.board[this.r][this.c]=s.board[this.r][this.c+1];
					s.board[this.r][this.c+1]=0;
					s.c=this.c+1;
					break;
			}
			return s;
		}
		State.prototype.equals=function(s){
			for(var i=0; i<3; i++){
				for(var j=0; j<3; j++){
					if(this.board[i][j]!=s.board[i][j]){
						return false;
					}
				}
			}
			return true;
		}

		//problema
		function Problem(){
			this.initialState=new State();
			this.states=[];
		}

		//verifique se a matriz contém um estado equivalente a s
		function contains(a,s){
			var i = a.length;
			while (i--) {
				if (a[i].equals(s)) {
				    return true;
				}
			}
			return false;
		}
		Problem.prototype.addTo=function(actions, s, a){
			if(s==null) return;
			if(!contains(this.states,s)){
				this.states.push(s);
				actions[a]=s;
			}
		}
		Problem.prototype.succ=function(s){
			var actions = {};
			this.addTo(actions, s.apply(actionUP), actionUP);
			this.addTo(actions, s.apply(actionDOWN), actionDOWN);
			this.addTo(actions, s.apply(actionLEFT), actionLEFT);
			this.addTo(actions, s.apply(actionRIGHT), actionRIGHT);
			return actions;
		}
		Problem.prototype.goalTest=function(s){
			for(var i=0; i<3; i++){
				for(var j=0; j<3; j++){
					var k=i*3+j
					if(s.board[i][j]!=k){
						return false;
					}
				}
			}
			console.log("solved");
			return true;
		}
		Problem.prototype.expand=function(n){
			var l = [];
			var choices = this.succ(n.state);
			for(var key in choices){
				var it = choices[key];
				l.push(new Node(it, n, parseInt(key), n.depth+1));
			}
			return l;
		}

		//procure um plano
		function searchForPlan(problem, selectNodeStrategy, queue, callback, startTime){
			if(startTime+10000<new Date().getTime()){
				callback("timeout");
				return;
			}
			for(var i=0; i<50; i++){
				if(queue.isEmpty()){
					callback(null);
					return;
				}else{
					var n = selectNodeStrategy(queue);
					if(n!=null){
						if(problem.goalTest(n.state)){
							callback(n);
							return;
						}else{
							problem.expand(n).forEach(function(it){ queue.enqueue(it); });
						}
					}
				}
			}
			$('#solution').append(".");
			setTimeout(function(){searchForPlan(problem, selectNodeStrategy, queue, callback, startTime);},0);
		}

		//executePlaneje o plano
		function executePlan(plan){
			if(plan.parent!=null && plan.action!=null){
				var n = plan;
				while(n.parent.action!=null) n=n.parent;
				swapNodes(0,n.parent.state.board[n.state.r][n.state.c]);
				n.action=null;
				setTimeout(function(){executePlan(plan);},300);	
			}else{
				solving=false;
			}
		}

		//imprimir o plano
		function printPlan(plan){
			if(plan.parent!=null){
				printPlan(plan.parent);
			}
			if(plan.action!=null){
				switch(plan.action){
					case actionUP:
						$('#solution').append("<br/ >UP"); break;
					case actionDOWN:
						$('#solution').append("<br/ >DOWN"); break;
					case actionLEFT:
						$('#solution').append("<br/ >LEFT"); break;
					case actionRIGHT:
						$('#solution').append("<br/ >RIGHT");
				}
			}
		}

		//callback
		function onSearchEnd(plan){
			if(plan=="timeout"){
				console.log("timeout");
				$('#solution').append("<br/ >Timeout");
				solving=false;
			}else if(plan!=null){
				console.log("found a plan");
				console.log(plan);
				$('#solution').append("<br/ >The Plan:");
				printPlan(plan);
				executePlan(plan);
			}else{
				console.log("plan not found");
				$('#solution').append("<br/ >Plan not found");
				solving=false;
			}
		}

		//comparar dois nós
		function compareNode(a,b){
			return b.state.getDelta()-a.state.getDelta();
		}

		//resolver
		function solve(){
			if(solving) return;
			solving=true;
			$('#solution').text('');
			var queue = new buckets.PriorityQueue(compareNode);
			var problem = new Problem();
			queue.enqueue(new Node(problem.initialState, null, null, 0));
			searchForPlan(problem, selectNode, queue, onSearchEnd, new Date().getTime());
		}

		//quando o documento estiver pronto embaralhe o tabuleiro
		$(function(){
			shuffle();
		});