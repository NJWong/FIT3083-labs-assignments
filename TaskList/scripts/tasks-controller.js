tasksController = function() {
    // Private data and methods
    var $taskPage;
    var initialised = false;

    function errorLogger(errorCode, errorMessage) {
        console.log(errorCode + ':' + errorMessage);
    }

    /* Recolor the Table Rows */
    var recolor = function() {
        $('#tblTasks tbody').find('tr').removeClass('even');
        $('#tblTasks tbody').find('tr:even').addClass('even');
    };

    return {
        // Public data and methods
        init: function(page, callback) {
            if (initialised) {
                callback();
            }
            else {
                $taskPage = page;

                storageEngine.init(function() {
                    storageEngine.initObjectStore('task', function() {callback();}, errorLogger);
                }, errorLogger);

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
                    storageEngine.delete('task', $(evt.target).data().taskId,
                        function() {
                            $(evt.target).parents('tr').remove();
                            recolor();
                        }, errorLogger);
                });

                /* Delete Selected Tasks */
                $btnDeleteSelection.click(function(evt) {
                    evt.preventDefault();

                    // Get the highlighted tr elements
                    var $highlighted = $tableBody.find('tr td:first-child[class="rowHighlight"]');
                    var num_selected_tasks = $highlighted.length;

                    if (num_selected_tasks === 0) {
                        alert("No tasks selected!");
                    } else if (confirm("Delete " + num_selected_tasks + " selected tasks!\nAre you sure?")) {

                        // For each of the highlighted rows
                        $highlighted.each(function() {

                            var $this_row = $(this);

                            // Delete from the storage engine
                            storageEngine.delete('task', parseInt($this_row.data().taskId),
                            function() {
                                // Update the UI on success
                                $this_row.closest('tr').remove();
                                recolor();
                            }, errorLogger);
                        });

                        // Need to put the alert in a setTimeout since alert boxes are blocking
                        setTimeout(function() {
                            alert(num_selected_tasks + " tasks deleted!");
                        }, 100);

                    } else {
                        alert("Delete cancelled");
                    }
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

                        storageEngine.save("task", task,
                            function() {
                                $taskPage.find('#tblTasks tbody').empty();
                                tasksController.loadTasks();
                                $(':input').val('');
                                $taskPage.find('#taskCreation').addClass('not');
                                // $taskRowTmpl.tmpl(task).appendTo($tableBody);
                            }, errorLogger);
                    }
                });

                /* Edit Task */
                $taskPage.find('#tblTasks tbody').on('click', '.editRow', function(evt) {
                    $taskPage.find('#taskCreation').removeClass('not');
                    storageEngine.findById('task', $(evt.target).data().taskId,
                        function(task) {
                            $taskPage.find('form').fromObject(task);
                        }, errorLogger);
                });

                initialised = true;
            }
        },
        loadTasks: function() {
            storageEngine.findAll('task', function(tasks) {
                $.each(tasks,function(index, task) {
                    $('#taskRow').tmpl(task).appendTo('#tblTasks tbody');
                    recolor();
                });
            }, errorLogger);
        }
    }
}();

