var MainFormHandler = function () {
    // module functions
    var init,
        sign_in,
        sign_up,
        show_from_error;
    // module const
    var redirect_url;

    init = function (url) {
        $('#login-form-link').click(function (e) {
            $("#login-form").delay(100).fadeIn(100);
            $("#register-form").fadeOut(100);
            $('#register-form-link').removeClass('active');
            $(this).addClass('active');
            e.preventDefault();
        });
        $('#register-form-link').click(function (e) {
            $("#register-form").delay(100).fadeIn(100);
            $("#login-form").fadeOut(100);
            $('#login-form-link').removeClass('active');
            $(this).addClass('active');
            e.preventDefault();
        });
        redirect_url = url
    };

    sign_in = function (url) {
        var data = $('#login-form').serialize();
        $.post(
            url,
            data,
            function (result) {
                if (result.success) {
                    Notifications.success(result.DATA['message']);
                    setTimeout(function () {
                        window.location.href = redirect_url;
                    }, 3000)
                } else {
                    Notifications.error(result.DATA['message']);
                }
            }
        );
    };

    sign_up = function (url) {
        var data = $('#register-form').serialize();
        $.post(
            url,
            data,
            function (result) {
                if (result.success) {
                    Notifications.success(result.DATA['message']);
                    setTimeout(function () {
                        window.location.href = redirect_url;
                    }, 3000)
                } else {
                    if ($.type(result.DATA['message']) == 'string') {
                        Notifications.error(result.DATA['message']);
                    } else {
                        show_from_error(result.DATA['message']);
                    }

                }
            }
        );
    };

    show_from_error = function (data) {
        $.each(data, function (key, value) {
            $('form [name=' + key + ']').after('<div class="error">' + value[0] + '</div>')
        });
        setTimeout(function () {
            $('.error').remove();
        }, 3000);
    };

    return {
        init: init,
        sign_in: sign_in,
        sign_up: sign_up,
        show_from_error: show_from_error
    }
}();

var Notifications = function () {
    var info,
        error,
        success;

    info = function (message) {
        $.notify(message, "info");
    };

    error = function (message) {
        $.notify(message, "error");
    };

    success = function (message) {
        $.notify(message, "success");
    };

    return {
        info: info,
        error: error,
        success: success
    }
}();

var ToDoList = function () {

    var init,
        countTodos,
        createTodo,
        done,
        allDone,
        removeItem,
        save_task,
        update_task,
        delete_task,
        getCookie;
    // init module
    init = function () {
        $("#sortable").sortable();
        $("#sortable").disableSelection();
        countTodos();
        // all done btn
        $("#checkAll").click(function () {
            allDone();
        });
        //create task
        $('.add-todo').on('keypress', function (e) {
            e.preventDefault
            if (e.which == 13) {
                if ($(this).val() != '') {
                    var todo = $(this).val();
                    createTodo(todo);
                    countTodos();
                }
            }
        });
        // mark task as done
        $('.todolist').on('change', '#sortable li input[type="checkbox"]', function () {
            if ($(this).prop('checked')) {
                var doneItem = $(this).parent().parent().find('label').text(),
                    id = $(this).parent().parent().parent().attr('task_id');
                $(this).parent().parent().parent().addClass('remove');
                done(doneItem, id);
                countTodos();
            }
        });
        //delete done task from "already done"
        $('.todolist').on('click', '.remove-item', function () {
            removeItem(this);
        });
        $.ajaxSetup({
            beforeSend: function (xhr, settings) {
                if (!(/^http:.*/.test(settings.url) || /^https:.*/.test(settings.url))) {
                    // Only send the token to relative URLs i.e. locally.
                    xhr.setRequestHeader("X-CSRFToken", getCookie('csrftoken'));
                }
            }
        });
    };
    // count tasks
    countTodos = function () {
        var count = $("#sortable li").length;
        $('.count-todos').html(count);
    };
    //create task
    createTodo = function (text) {
        save_task({'task': text});
    };
    //mark task as done
    done = function (doneItem, id) {
        update_task({
            'done': true,
            'id': id
        }, doneItem);
    };
    //mark all tasks as done
    allDone = function () {
        $('#sortable li').each(function (index, val) {
            done($(val).children().children().text(), $(val).attr('task_id'))
        });
        $('#sortable li').remove();
    };
    //remove done task from list
    removeItem = function (element) {
        delete_task({
            'id': $(element).parent().attr('task_id'),
        }, element);
    };

    save_task = function (data) {
        $.post(
            '/',
            data,
            function (result) {
                if (result.success) {
                    var markup = ''
                        + '<li class="ui-state-default" task_id="' + result['id'] + '" >'
                        + '<div class="checkbox">'
                        + '<label>'
                        + '<input type="checkbox" value="" />'
                        + data['task']
                        + '</label>'
                        + '</div>'
                        + '</li>';
                    Notifications.success(result.DATA['message']);
                    $('#sortable').append(markup);
                    $('.add-todo').val('');
                    countTodos();
                } else {
                    Notifications.error(result.DATA['message']);
                }
            }
        );
    };
    update_task = function (data, doneItem) {
        $.ajax({
            url: '/',
            type: 'PUT',
            success: function (result) {
                if (result.success) {
                    var done = doneItem,
                        markup = ''
                            + '<li task_id="' + data['id'] + '">'
                            + done
                            + '<button class="btn btn-default btn-xs pull-right  remove-item">'
                            + '<span class="glyphicon glyphicon-remove">'
                            + '</span>'
                            + '</button>'
                            + '</li>';
                    Notifications.success(result.DATA['message']);
                    $('#done-items').append(markup);
                    $('.remove').remove();
                    countTodos();
                } else {
                    Notifications.error(result.DATA['message']);
                }
            },
            data: data
        });
    };
    delete_task = function (data, element) {
        $.ajax({
            url: '/',
            type: 'DELETE',
            success: function (result) {
                if (result.success) {
                    $(element).parent().remove();
                    Notifications.success(result.DATA['message']);
                    countTodos();
                } else {
                    Notifications.error(result.DATA['message']);
                }
            },
            data: data
        });
    };
    getCookie = function (name) {
        var cookieValue = null;
        if (document.cookie && document.cookie != '') {
            var cookies = document.cookie.split(';');
            for (var i = 0; i < cookies.length; i++) {
                var cookie = jQuery.trim(cookies[i]);
                // Does this cookie string begin with the name we want?
                if (cookie.substring(0, name.length + 1) == (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    };
    return {
        init: init
    }
}();
