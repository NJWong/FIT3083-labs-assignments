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
        // ...
        init: function(page) {

            if (!initialised) {
                $taskPage = page;

                // Add star next to required fields
                $('[required="required"]').prev('label').append('<span>*</span>').children('span').addClass('required');

                // Style the table rows with alternate background colors
                var recolor = function() {
                    $('tbody tr').removeClass('even');
                    $('tbody tr:even').addClass('even');
                }

                // Show the task creation section when the add task button is clicked
                $('#btnAddTask').click(function(evt) {
                    evt.preventDefault();
                    $('#taskCreation').removeClass('not');
                });

                // Add click event handler for tbody that toggles row highlighting
                $('tbody').on('click', 'td', 'time', function(evt) {
                    $(evt.target).closest('td').siblings().addBack().toggleClass('rowHighlight');
                });

                // Add click event handler to delete a row
                $('#tblTasks tbody').on('click', '.deleteRow', function(evt) {
                    evt.preventDefault();
                    $(evt.target).parents('tr').remove();
                    recolor();
                });

                // Add click event handler to save a task
                $('#saveTask').click(function(evt) {
                    evt.preventDefault();
                    var task = $('form').toObject();
                    $('#taskRow').tmpl(task).appendTo($('#tblTasks tbody'));
                    recolor();
                });

                // Add click event handler to delete all selected rows
                $('#btnDeleteSelectedTasks').click(function(evt) {
                    evt.preventDefault();

                    var $highlighted = $('tbody tr td:first-child[class="rowHighlight"]');
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