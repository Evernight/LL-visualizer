$(document).ready(function() {
	$("#firstBtn").click(function() {
		Algorithm.init();
	});

	$("#grammar_edit_link").click(function() {
		$("#grammar_save_btn").show();
		$("#grammar_cancel_btn").show();
		$("#grammar_edit_link").hide();
		$("#grammar_edit").attr("readonly", false);
		$("#grammar_edit").toggleClass("editable");
	});

	$("#grammar_save_btn").click(function() {
		var error = Algorithm.check_grammar($("#grammar_edit").get(0).value);
		if (error == "") {
			$("#grammar_save_btn").hide();
			$("#grammar_cancel_btn").hide();
			$("#grammar_edit_link").show();
			$("#grammar_edit").attr("readonly", true);
			$("#grammar_edit").toggleClass("editable");
			$("#error_panel").hide();

			Algorithm.init();
		} else {
			$("#error_panel").html("<b>Ошибка:</b> " + error);
			$("#error_panel").show();
		}		
	});

	$("#grammar_cancel_btn").click(function() {
		$("#grammar_save_btn").hide();
		$("#grammar_cancel_btn").hide();
		$("#grammar_edit_link").show();
		$("#grammar_edit").attr("readonly", true);
		$("#grammar_edit").toggleClass("editable");
		$("#error_panel").hide();

		$("#grammar_edit").get(0).textContent = Algorithm.grammar;
	});

	$("#chain_edit_link").click(function() {
		$("#chain_edit_block").show();
		$("#chain_edit").get(0).value = $("#chain").get(0).textContent;
	});

	$("#chain_save").click(function() {
		$("#chain_edit_block").hide();
		$("#chain").get(0).textContent = $("#chain_edit").get(0).value;
		
		Algorithm.init();
	});

	$("#prevBtn").click(function() {
		Algorithm.prev_step();
	});

	$("#nextBtn").click(function() {
		Algorithm.next_step();
	});

	$("#autoBtn").click(function() {
		Algorithm.auto();
	});

	$("#lastBtn").click(function() {
		Algorithm.all();
	});

	Algorithm.init();
});

(function($) {
$(function() {

  $('ul.tabs').delegate('li:not(.current)', 'click', function() {
    $(this).addClass('current').siblings().removeClass('current')
      .parents('div.section').find('div.box').hide().eq($(this).index()).fadeIn(150);
  })

})
})(jQuery)