// TODO documentation
// TODO tree
// TODO output
// TODO table
// TODO presets
// TODO design issues

var Algorithm = new function() {
	var parsing_stack, chain, history, parsing_table, rules, step_num, grammar;
	var old_chain, old_stack, state, auto_step;

	// type of return values for pair of symbols
	var Action = {
		"UNEXPECTED": -4,
		"MISSING" : -3,
		"PASS" : -2,
		"FINISH": -1
	}

	var State = {
		"PARSING" : 1,
		"FINISHED" : 2
	}

	this.is_nonterminal = function(x) {
		return /[A-Z]/.test(x);
	}

	this.is_terminal = function(x) {
		return !this.is_nonterminal(x);
	}

	/*
	 * Refreshes visualization page so that contains actual information
	 */
	this.refresh = function() {
		$("#cur_chain").get(0).textContent = chain;
		$("#cur_stack").get(0).textContent = parsing_stack;
		$("#cur_step").get(0).textContent = step_num;
		$("#old_chain").get(0).textContent = old_chain;
		$("#old_stack").get(0).textContent = old_stack;

		if (history.length == 0) {
			$("#prevBtn").get(0).disabled = true;
		} else {
			$("#prevBtn").get(0).disabled = false;
		}
		if (state == State.FINISHED) {
			$("#nextBtn").get(0).disabled = true;
			$("#lastBtn").get(0).disabled = true;
		}
	}

	/*
	 * Sets description of current step in "Description" field
	 */
	this.set_description = function(text) {
		$($("#description").children()[0].children[1]).html(text);
	};

	/*
	 * Outputs grammar rules into special field
	 */
	this.output_rules = function() {
		var text = "Здесь указан список правил, полученных при обработке исходной грамматики.<br/>"
		var table = "<table class=\"rules\">";
		table += "<tr><th>#</th><th>Правило</th><tr/>";
		$.each(rules, function(i, v) {
			table += "<tr><td>" + i + ". </td><td>" + v.l + " ::= " + v.r + "</td><tr/>";
		});
		table += "</table>"
		$("#rules_list").html(text + table);
	};

	/*
	 * Initializes algorithm
	 */
	this.init = function() {
		// Get all input values currently stored in 'edit' fields
		init_tree();
		var chain_str = document.getElementById("chain").textContent.replace(/ /g,"") + "#";
		chain = []
		for (var i = 0; i < chain_str.length; ++i)
			chain[i] = chain_str[i];
		old_chain = "-";
		old_stack = "-";

		// Transforming text in grammar box into rules
		this.grammar = $("#grammar_edit").get(0).value;

		grammar = this.grammar.replace(/ /g, "");
		var rules_re = /([A-Z])::=(.*)/g;
		rules = []
		var cnt = 0;
		while ((item = rules_re.exec(grammar)) != null) {
			var left = item[1];
			var right = item[2];
			$.each(right.split("|"), function(i, v) {
				var rule = {"l" : left, "r": v, "n": cnt};
				rules[cnt++] = rule;
				//alert(rule.l + " " + rule.r);
			});
		}
		Algorithm.output_rules();

		// Initialize main variables
		parsing_stack = ["#", "S"];
		history = [];
		step_num = 0;

		// Generates parsing table, TODO: visualize this
		this.generate_table();
		state = State.PARSING;

		// Some UI stuff before go
		Algorithm.refresh();
		$("#prevBtn").get()[0].disabled = true;
		$("#nextBtn").get(0).disabled = false;
		$("#lastBtn").get(0).disabled = false;
		$("#autoBtn").get(0).disabled = true;
		var desc = "Нажмите \"Следующий шаг\" для того, чтобы алгоритм начал работу. ";
		desc += "Есть возможность изменить грамматику или проверяемую цепочку. Для этого используйте соответствующие ссылки. ";
		Algorithm.set_description(desc);
	};

	/*
	 * Generates parsing table
	 */
	this.generate_table = function() {
		var first = {}
		$.each(rules, function(i, rule) {
			first[rule.l] = {};
		});
		while (true) {
			var changed = false;

			$.each(rules, function(i, rule) {
				var s = rule.r[0];
				var new_set = {};
				if (Algorithm.is_terminal(s)) {
					new_set[s] = true;
				} else {
					new_set = first[s];
				}
				$.each(new_set, function(item) {
					if (!(item in first[rule.l])) {
						changed = true;
						first[rule.l][item] = rule.n;
					}
				});
			});

			if (!changed)
				break;			
		}

		parsing_table = {};
		$.each(first, function(i, v) {
			$.each(v, function(c, n) {
				if (!(i in parsing_table))
					parsing_table[i] = {};
				parsing_table[i][c] = n;
			});
		});
	};

	/*
	 *  Return action to perform when we've got two symbols
	 *  from chain and from stack
	 */
	this.action = function(s, t) {
		if (s == "#" && t == "#")
			return Action.FINISH;
		if (Algorithm.is_terminal(s) && Algorithm.is_terminal(t)) {
			if (s == t)
				return Action.PASS;
			else
				return Action.UNEXPECTED;
		}
		try {
			return parsing_table[s][t];
		} catch(err) {
			return Action.MISSED;
		}
		return Action.MISSED;
	}

	/*
	 *  Button 'Next step' handling
	 */
	this.next_step = function()  {
		history.push(1);

		old_chain = String(chain);
		old_stack = String(parsing_stack);
		var s = parsing_stack[parsing_stack.length - 1];
		var t = chain[0];
		var act = Algorithm.action(s, t);
		switch (act) {
			case Action.FINISH:
				Algorithm.set_description("Получена пара символов ( <b>#</b> , <b>#</b> ). Алгоритм успешно завершил свою работу.");
				state = State.FINISHED;
				break;
			case Action.UNEXPECTED:
				Algorithm.set_description("Произошла ошибка, т.к. получена пара терминальных символов ( <b>" + s + "</b> , <b>" + t + "</b> ), которые не совпадают. Алгоритм завершён: данная цепочка не принадлежит порождаемому грамматикой языку.");
				state = State.FINISHED;
				break;
			case Action.MISSED:
				Algorithm.set_description("Произошла ошибка, т.к. данной пары символов ( <b>" + s + "</b> , <b>" + t + "</b> ) нет в служебной таблице. Алгоритм завершён: данная цепочка не принадлежит порождаемому грамматикой языку.");
				state = State.FINISHED;
				break;
			case Action.PASS:
				parsing_stack.pop();
				chain.reverse(); chain.pop(); chain.reverse();
				Algorithm.set_description("Получена пара терминальных символов ( <b>" + s + "</b> , <b>" + t + "</b> ), которые совпадают. Выбрасываем их из стека и из входной цепочки. ");
				break;
			default:
				// So we get pair that have an appropriate rule to be used
				parsing_stack.pop();
				var r = rules[act].r;
				L = [];
				for (var i = r.length - 1; i >= 0; --i) {
					parsing_stack.push(r[i]);
					L.push(r[i]);
				}
				desc =  "Получена пара символов ( <b>" + s + "</b> , <b>" + t + "</b> ). Согласно служебной таблице, применяется правило <b>#" + act + "</b> ";
				desc += "( <b>" + s + " ::= " + r +"</b> ).<br/>"
				desc += "Мы выбрасываем из стека символ <b>" + s + "</b> и кладём символы из правой части правила в обратном порядке: ";
				desc += "<b>" + L + "</b>.";
				Algorithm.set_description(desc);
				break;
		}
		
		step_num += 1;
		Algorithm.refresh();
	};

	/*
	 *  Checking grammar for errors presence
	 */
	this.check_grammar = function(text) {
		text = text.replace(/ /g, "");
		var rules_re = /^([A-Z])::=(.+)/;
		var tmp_rules = [];
		var cnt = 0;
		text = text.split("\n");
		var err = "";
		$.each(text, function(j, line) {
			if (line == "")
				return;
			if (!rules_re.test(line) || /.*::=.*::=/.test(line)) {
				err = "строка " + (j + 1) + " должна иметь вид <b>X ::= A</b> или <b>X ::= A | B | ...</b>";
				return;
			}
			if (/#/.test(line)) {
				err = "<b>#</b> — зарезервированный символ, поэтому не стоит его использовать в строке " + (j + 1);
				return;
			}
			var item = rules_re.exec(line);
			var left = item[1];
			var right = item[2];
			$.each(right.split("|"), function(i, v) {
				if (v == "") {
					err = "В строке " + (j + 1) + " есть правило вида <b>X ::= пустая цепочка</b>";
					return;
				}
				var rule = {"l" : left, "r": v, "n": cnt};
				tmp_rules[cnt++] = rule;
			});
		});
		if (err != "")
			return err;

		return "";
	}

	/*
	 *  Button 'Previous step' handling
	 */
	this.prev_step = function() {		
		history.pop()

		step_num -= 1;
		$("#nextBtn").get(0).disabled = false;
		Algorithm.set_description("Откат изменений.");		
		Algorithm.refresh();
		$("#nextBtn").get(0).disabled = false;
	};

	/*
	 *  Button 'Auto' handling
	 */
	this.auto = function() {
		$("#nextBtn").get(0).disabled = true;
		if (state != State.FINISHED) {
			window.setTimeout(Algorithm.next_step(), 6000);
		}		
	};

	/*
	 *  Button 'To end' handling
	 */
	this.all = function() {
		while (state != State.FINISHED)
			Algorithm.next_step();
	};
};
