tasksController = function() {
    // Private data and methods
    var $taskPage;
    var initialised = false;

    function errorLogger(errorCode, errorMessage) {
        console.log(errorCode + ':' + errorMessage);
    }

    function updateTaskCount() {
        $("footer").find("#tasksCounter").text(taskCount);
    }

    function clearTask() {
        $taskPage.find("form").fromObject({});
    }

    /* Recolor the Table Rows */
    var recolor = function() {
        $('#tblTasks tbody').find('tr').removeClass('even');
        $('#tblTasks tbody').find('tr:even').addClass('even');
        overdueAndWarningBands();
    };

    function overdueAndWarningBands() {
        $.each($taskPage.find("#tblTasks tbody tr"), function(index, row) {
            var $row = $(row);
            var dueDate = Date.parse($row.find("[datetime]").text());
            if (dueDate.compareTo(Date.today()) < 0) {
                $row.removeClass("even");
                $row.addClass("overdue");
            }
            else if (dueDate.compareTo((2).days().fromNow()) <= 0) {
                $row.removeClass("even");
                $row.addClass("warning");
            }
        });
    }

    function loadFromCSV(event) {
        var reader = new FileReader();
        reader.onload = function(evt) {
            var contents = evt.target.result;
            var lines = contents.split('\n');
            var tasks = [];

            $.each(lines, function(i, val) {
                if (i >= 1 && val) {
                    var task = loadTask(val);
                    if(task) {
                        tasks.push(task);
                    }
                }
            });
            storageEngine.saveAll('task', tasks, function() {
                tasksController.loadTasks();
            }, errorLogger);
        };
        reader.onerror = function(evt) {
            errorLogger('cannot_read_file', 'Error reading the specified file');
        };

        reader.readAsText(event.target.files[0]);
    }

    function loadTask(csvTask) {
        var tokens = $.csv.toArray(csvTask);
        if (tokens.length === 4) {
            var task = {};
            task.task = tokens[0];
            task.requiredBy = tokens[1];
            task.category = tokens[2];
            task.complete = tokens[3];
            return task;
        }
        else {
            return null;
        }
    }

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
                            taskCount -= 1;
                            updateTaskCount();
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

                        taskCount -= $highlighted.length
                        updateTaskCount();

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
                        task.complete = false;
                        storageEngine.save("task", task,
                            function() {
                                tasksController.loadTasks();
                                clearTask();
                                $taskPage.find('#taskCreation').addClass('not');
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

                /* Complete a Task */
                $taskPage.find('#tblTasks tbody').on('click', '.completeRow', function(evt) {
                    storageEngine.findById('task', $(evt.target).data().taskId, function(task) {
                        task.complete = true;
                        storageEngine.save('task', task, function() {
                            tasksController.loadTasks();
                        }, errorLogger)
                    })
                });

                /* Clear Task */
                $taskPage.find("#clearTask").click(function(evt) {
                    evt.preventDefault();
                    clearTask();
                });

                /* Import CSV File */
                $('#importFile').change(loadFromCSV);

                initialised = true;
            }
        },
        loadTasks: function() {
            $taskPage.find('#tblTasks tbody').empty();
            storageEngine.findAll('task', function(tasks) {

                /* Sort the tasks */
                tasks.sort(function(task1, task2) {
                    var date1, date2;
                    date1 = Date.parse(task1.requiredBy);
                    date2 = Date.parse(task2.requiredBy);

                    return date1.compareTo(date2);
                });

                /* Add the UI elements */
                $.each(tasks, function(index, task) {
                    $('#taskRow').tmpl(task).appendTo('#tblTasks tbody');
                    taskCount = tasks.length;
                    updateTaskCount();
                    recolor();
                });
            }, errorLogger);
        }
    }
}();

