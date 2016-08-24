function closureObject() {
    var i = 0;
    return {
        addOne: function() {
            return ++i;
        }
    };
}

tasksController = function() {
    // Private data and methods
    var $taskPage;
    var initialised = false;

    return {
        // Public data and methods
        init: function(page) {

            if (!initialised) {
                $taskPage = page;

                /* Contextualising elements in first section */
                var $taskCreation = $taskPage.find('#taskCreation');
                var $taskForm = $taskCreation.find('#taskForm');
                var $taskFormRequired = $taskForm.find('[required="required"]');
                var $saveTask = $taskForm.find('#saveTask');
                var $clearTask = $taskForm.find('#clearTask'); // not used yet...

                /* Contextualising elements in section section */
                var $tblTasks = $taskPage.find('#tblTasks');
                var $tableBody = $tblTasks.find('tbody');
                var $btnAddTask = $taskPage.find('#btnAddTask')
                var $btnDeleteSelection = $taskPage.find('#btnDeleteSelectedTasks');

                /* Contextualise the task row template */
                var $taskRowTmpl = $('#taskRow');

                /* Show the 'required' fields in the form */
                $taskFormRequired.prev('label').append('<span>*</span>').children('span').addClass('required');

                /* Recolor the Table Rows */
                var recolor = function() {
                    $tableBody.find('tr').removeClass('even');
                    $tableBody.find('tr:even').addClass('even');
                };

                /* Show New Task Form */
                $btnAddTask.click(function(evt) {
                    evt.preventDefault();
                    $taskCreation.removeClass('not');
                });

                /* Toggle Task Highlight */
                $tableBody.on('click', 'td', 'time', function(evt) {
                    $(evt.target).closest('td').siblings().addBack().toggleClass('rowHighlight');
                });

                /* Delete Task */
                $tableBody.on('click', '.deleteRow', function(evt) {
                    evt.preventDefault();
                    $(evt.target).parents('tr').remove();
                    recolor();
                });

                /* Set up the validation rules for the form */
                $taskForm.validate({
                    rules: {
                        task: {
                            maxlength: 20
                        }
                    }
                });

                /* Custom jQuery validator messages */
                jQuery.extend(jQuery.validator.messages, {
                    maxlength: jQuery.validator.format("Custom: This field accepts a maxmimum of {0} characters.")
                });

                /* Save Task */
                $saveTask.click(function(evt) {
                    evt.preventDefault();

                    // Check if the form is valid
                    if ($taskForm.valid()) {
                        var task = $taskForm.toObject();
                        $taskRowTmpl.tmpl(task).appendTo($tableBody);
                        recolor();
                    }
                });

                /* Delete Selected Tasks */
                $btnDeleteSelection.click(function(evt) {
                    evt.preventDefault();

                    var $highlighted = $tableBody.find('tr td:first-child[class="rowHighlight"]');
                    var num_selected_tasks = $highlighted.length;

                    if (num_selected_tasks === 0) {
                        alert("No tasks selected!");
                    } else if (confirm("Delete " + num_selected_tasks + " selected tasks!\nAre you sure?")) {
                        $highlighted.each(function() {
                            $(this).closest('tr').remove();
                            recolor();
                        });

                        // Need to put the alert in a setTimeout since alert boxes are blocking
                        setTimeout(function() {
                            alert(num_selected_tasks + " tasks deleted!");
                        }, 1);

                    } else {
                        alert("Delete cancelled");
                    }
                });

                initialised = true;
            }
        }
    }
}();