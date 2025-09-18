// To use the actionbar, the following parameters should be met:
// 1. There is an iframe for controled workspace content with the id "workspace-iframe"
// 2. The actionbar and iframe are decendents of a common ancestor with the class "challenge-workspace"
// 3. The page implements a function, doFullscreen(event) to handle a fullscreen event
// 4. Optionally, the page can have a div with the class "workspace-ssh" which will be displayed when the SSH option is selected.

// Initialize challenge panel functionality
function initializeChallengePanel() {
    const challengeDisplay = document.getElementById('active-challenge-display');
    const panel = document.getElementById('challenge-details-panel');

    if (challengeDisplay && panel) {
        // Setup click handler for challenge display
        $(challengeDisplay).off('click').on('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            toggleChallengePanel();
        });

        // Setup panel controls
        $('#panel-close').on('click', function() {
            hideChallengePanel();
        });

        $('#panel-resize-toggle').on('click', function() {
            $(panel).toggleClass('expanded');
        });

        // Setup resizing functionality
        initializePanelResize();
    }
}

function toggleChallengePanel() {
    const panel = document.getElementById('challenge-details-panel');
    const isVisible = panel.classList.contains('visible');

    if (isVisible) {
        hideChallengePanel();
    } else {
        showChallengePanel();
    }
}

function showChallengePanel() {
    const panel = document.getElementById('challenge-details-panel');
    const challengeId = document.getElementById('current-challenge-id')?.value;
    const challengeName = document.getElementById('current-challenge-id')?.getAttribute('data-challenge-name');

    panel.classList.add('visible');

    // Trigger resize after a short delay to allow CSS transition to complete
    setTimeout(triggerWorkspaceResize, 100);

    if (challengeId && challengeName) {
        // Show loading state
        $('.challenge-panel-loading').show();
        $('#challenge-panel-body').hide();
        $('#panel-challenge-name').text(challengeName);

        // Fetch challenge details
        fetch('/pwncollege_api/v1/docker')
            .then(response => response.json())
            .then(dockerData => {
                if (dockerData.success && dockerData.dojo && dockerData.module && dockerData.challenge) {
                    const dojo = dockerData.dojo;
                    const module = dockerData.module;
                    const challenge = dockerData.challenge;

                    return fetch(`/pwncollege_api/v1/dojos/${dojo}/${module}/${challenge}/description`);
                } else {
                    // Fallback: try URL-based approach
                    return tryUrlBasedChallengeForPanel(challengeId);
                }
            })
            .then(response => response.json())
            .then(data => {
                $('.challenge-panel-loading').hide();
                if (data.success && data.description) {
                    $('#challenge-panel-body').html(data.description).show();
                } else {
                    $('#challenge-panel-body').html('<p>Challenge details not available in this view.</p>').show();
                }
            })
            .catch(error => {
                console.error('Error fetching challenge details:', error);
                $('.challenge-panel-loading').hide();
                $('#challenge-panel-body').html('<p>Error loading challenge details.</p>').show();
            });
    }
}

function tryUrlBasedChallengeForPanel(challengeId) {
    const pathParts = window.location.pathname.split('/');
    const dojoIndex = pathParts.indexOf('dojos');
    if (dojoIndex >= 0 && pathParts.length > dojoIndex + 2) {
        const dojo = pathParts[dojoIndex + 1];
        const module = pathParts[dojoIndex + 2];
        return fetch(`/pwncollege_api/v1/dojos/${dojo}/${module}/${challengeId}/description`);
    } else {
        return Promise.reject(new Error('Cannot determine challenge path'));
    }
}

function hideChallengePanel() {
    const panel = document.getElementById('challenge-details-panel');
    panel.classList.remove('visible');

    // Trigger resize after a short delay to allow CSS transition to complete
    setTimeout(triggerWorkspaceResize, 100);
}

function triggerWorkspaceResize() {
    // Trigger resize event for iframe to recalculate its dimensions
    const iframe = document.getElementById('workspace-iframe');
    if (iframe && iframe.contentWindow) {
        try {
            iframe.contentWindow.dispatchEvent(new Event('resize'));
        } catch (e) {
            // Cross-origin iframe, can't dispatch events
        }
    }

    // Also trigger window resize for any listeners
    window.dispatchEvent(new Event('resize'));
}

function initializePanelResize() {
    const panel = document.getElementById('challenge-details-panel');
    if (!panel) {
        console.log('Panel not found!');
        return;
    }

    const resizeHandle = panel.querySelector('.challenge-panel-resize-handle');
    if (!resizeHandle) {
        console.log('Resize handle not found!');
        return;
    }

    console.log('Panel resize initialized');
    let isResizing = false;

    resizeHandle.addEventListener('mousedown', function(e) {
        console.log('Starting resize');
        isResizing = true;
        document.body.style.cursor = 'ew-resize';
        document.addEventListener('mousemove', handleResize);
        document.addEventListener('mouseup', stopResize);
        e.preventDefault();
    });

    function handleResize(e) {
        if (!isResizing) return;
        const newWidth = window.innerWidth - e.clientX;
        const maxWidth = window.innerWidth * 0.5;
        if (newWidth >= 300 && newWidth <= maxWidth) {
            panel.style.width = newWidth + 'px';
            triggerWorkspaceResize();
        }
    }

    function stopResize() {
        console.log('Stopping resize');
        isResizing = false;
        document.body.style.cursor = '';
        document.removeEventListener('mousemove', handleResize);
        document.removeEventListener('mouseup', stopResize);
        triggerWorkspaceResize();
    }
}


// Returns the controls object containing the origin of the event.
function context(event) {
    return $(event.target).closest(".workspace-controls");
}

function getServiceHistory() {
    var raw = localStorage.getItem("service_history");
    if (raw === null) {
        return [];
    }

    return raw.split(", ");
}

function logService(service) {
    var services = getServiceHistory();
    var index = services.indexOf(service);
    if (index >= 0) {
        services.splice(index, 1);
    }
    services.forEach((element, index, array) => {
        service += ", ";
        service += element;
    })
    localStorage.setItem("service_history", service);
}

// Get most recent service which is allowed by the selector within the given root actionbar.
function getRecentService(root) {
    var options = [];
    var allowed = root.find("#workspace-select").find("option");
    allowed.each((index, value) => {
        options.push($(value).prop("value"));
    });
    var history = getServiceHistory();
    var match = null;
    history.forEach((element, index, array) => {
        if (match == null && options.indexOf(element) != -1) {
            match = element;
        }
    });

    return match;
}

function selectService(service) {
    const content = document.getElementById("workspace-iframe");
    if (!content) {
        console.log("Missing workspace iframe :(")
        return;
    }
    logService(service);
    port = service.split(": ")[1];
    service = service.split(": ")[0];
    if (service == "ssh" && port == "") {
        content.src = "";
        $(content).addClass("SSH");
        $(".workspace-ssh").show();
        return;
    }
    else {
        $(content).removeClass("SSH");
        $(".workspace-ssh").hide();
    }
    const specialServices = ["terminal", "code", "desktop"];
    const specialPorts = ["7681", "8080", "6080"];
    if (specialServices.indexOf(service) > -1 && specialServices.indexOf(service) == specialPorts.indexOf(port)) {
        const url = new URL("/pwncollege_api/v1/workspace", window.location.origin);
        url.searchParams.set("service", service);
        fetch(url, {
            method: "GET",
            credentials: "same-origin"
        })
        .then(response => response.json())
        .then(result => {
            if (result.success) {
                content.src = result["iframe_src"];
            }
            else {
                content.src = "";
                console.log
                animateBanner(
                    {target: $(content).closest(".challenge-workspace").find("#workspace-select")[0]},
                    result.error,
                    "error"
                );
            }
        });
    }
    else {
        content.src = "/workspace/" + port + "/";
    }
}

function animateBanner(event, message, type) {
    const color = {
        success: "var(--brand-green)",
        error:   "var(--error)",
        warn:    "var(--warn)"
    }[type] ?? "var(--warn)";
    const animation = type === "success" ? "animate-banner" : "animate-banner-fast";

    context(event).find("#workspace-notification-banner").removeClass("animate-banner animate-banner-fast");
    context(event).find("#workspace-notification-banner")[0].offsetHeight;  // Force reflow of element to play animation again.
    context(event).find("#workspace-notification-banner")
      .html(message)
      .css("border-color", color)
      .addClass(animation);
}

function actionSubmitFlag(event) {
    context(event).find("input").prop("disabled", true).addClass("disabled");
    context(event).find(".input-icon").toggleClass("fa-flag fa-spinner fa-spin");
    var body = {
        'challenge_id': parseInt(context(event).find("#current-challenge-id").val()),
        'submission': $(event.target).val(),
    };
    var params = {};

    CTFd.api.post_challenge_attempt(params, body)
    .then(function (response) {
        const challengeName = context(event).find("#current-challenge-id").attr("data-challenge-name") || "Challenge";
        console.log("Flag response:", response.data.status, "Challenge name:", challengeName);

        if (response.data.status == "incorrect") {
            animateBanner(event, "❌ Incorrect Flag", "error");
        }
        else if (response.data.status == "correct") {
            animateBanner(event, "&#127881 Successfully completed <b>" + challengeName + "</b>! &#127881", "success");
            if ($(".challenge-active").length) {
                const unsolved_flag = $(".challenge-active").find("i.challenge-unsolved")
                if(unsolved_flag.hasClass("far") && unsolved_flag.hasClass("fa-flag")) {
                    unsolved_flag.removeClass("far")
                    unsolved_flag.addClass("fas")
                }
                unsolved_flag
                    .removeClass("challenge-unsolved")
                    .addClass("challenge-solved");
            }
        }
        else if (response.data.status == "already_solved") {
            animateBanner(event, "Challenge already solved", "success");
        }
        else {
            animateBanner(event, "Submission Failed.", "warn");
        }
        context(event).find("input").prop("disabled", false).removeClass("disabled");
        context(event).find(".input-icon").toggleClass("fa-flag fa-spinner fa-spin");
    });
}

function actionStartChallenge(event) {
    const privileged = context(event).find("#workspace-change-privilege").attr("data-privileged") === "true";

    CTFd.fetch("/pwncollege_api/v1/docker", {
        method: "GET",
        credentials: 'same-origin'
    }).then(function (response) {
        if (response.status === 403) {
            // User is not logged in or CTF is paused.
            window.location =
                CTFd.config.urlRoot +
                "/login?next=" +
                CTFd.config.urlRoot +
                window.location.pathname +
                window.location.hash;
        }
        return response.json();
    }).then(function (result) {
        if (result.success == false) {
            return;
        }

        var params = {
            "dojo": result.dojo,
            "module": result.module,
            "challenge": result.challenge,
            "practice": privileged,
        };

        CTFd.fetch('/pwncollege_api/v1/docker', {
            method: 'POST',
            credentials: 'same-origin',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(params)
        }).then(function (response) {
            return response.json;
        }).then(function (result) {
            if (result.success == false) {
                return;
            }

            selectService(context(event).find("#workspace-select").prop("value"));

            context(event).find(".btn-challenge-start")
            .removeClass("disabled")
            .removeClass("btn-disabled")
            .prop("disabled", false);
        })
    });
}

function actionStartCallback(event) {
    event.preventDefault();

    context(event).find(".btn-challenge-start")
    .addClass("disabled")
    .addClass("btn-disabled")
    .prop("disabled", true);

    if (context(event).find("#challenge-restart")[0].contains(event.target)) {
        actionStartChallenge(event);
    }
    else if (context(event).find("#workspace-change-privilege").length > 0 && context(event).find("#workspace-change-privilege")[0].contains(event.target)) {
        context(event).find("#workspace-change-privilege").attr("data-privileged", (_, v) => v !== "true");
        displayPrivileged(event, false);
        actionStartChallenge(event);
    }
    else {
        console.log("Failed to start challenge.");

        context(event).find(".btn-challenge-start")
        .removeClass("disabled")
        .removeClass("btn-disabled")
        .prop("disabled", false);
    }
}

function displayPrivileged(event, invert) {
    const button = context(event).find("#workspace-change-privilege");
    const privileged = button.attr("data-privileged") === "true";
    const lockStatus = privileged === invert;

    button.find(".fas")
        .toggleClass("fa-lock", lockStatus)
        .toggleClass("fa-unlock", !lockStatus);

    button.attr("title", privileged ? "Restart unprivileged"
                                    : "Restart privileged");
}

function loadWorkspace() {
    if ($("#workspace-iframe").length == 0 ) {
        return;
    }
    var workspaceRoot = $("#workspace-iframe").closest(".challenge-workspace");
    var recent = getRecentService(workspaceRoot);
    if (recent == null) {
        recent = workspaceRoot.find("#workspace-select").prop("value");
    }
    else {
        workspaceRoot.find("#workspace-select").prop("value", recent);
    }
    selectService(recent);
}

$(() => {
    loadWorkspace();
    $(".workspace-controls").each(function () {
        if ($(this).find("option").length < 2) {
            $(this).find("#workspace-select")
                .prop("disabled", true)
                .prop("title", "");
        }

        $(this).find("#workspace-select").change((event) => {
            event.preventDefault();
            selectService(event.target.value);
        });

        $(this).find("#flag-input").on("input", function(event) {
            event.preventDefault();
            if ($(this).val().match(/pwn.college{.*}/)) {
                actionSubmitFlag(event);
            }
        });
        $(this).find("#flag-input").on("keypress", function(event) {
            if (event.key === "Enter" || event.keyCode === 13) {
                actionSubmitFlag(event);
            }
        });

        $(this).find(".btn-challenge-start").click(actionStartCallback);

        if ($(this).find("#workspace-change-privilege").length) {
            $(this).find("#workspace-change-privilege").on("mouseenter", function(event) {
                displayPrivileged(event, true);
            }).on("mouseleave", function(event) {
                displayPrivileged(event, false);
            });
        }

        $(this).find("#fullscreen").click((event) => {
            event.preventDefault();
            context(event).find("#fullscreen i").toggleClass("fa-compress fa-expand");

            // Toggle fullscreen class for challenge controls visibility
            const challengeWorkspace = $(event.target).closest('.challenge-workspace');
            challengeWorkspace.toggleClass('fullscreen');

            doFullscreen(event);
        });

        // Initialize challenge panel
        initializeChallengePanel();

        // Next challenge button
        $(this).find("#next-challenge").click((event) => {
            event.preventDefault();
            const challengeId = $(this).find("#current-challenge-id").val();
            if (challengeId) {
                // Get current challenge context and start next challenge
                fetch('/pwncollege_api/v1/docker')
                    .then(response => response.json())
                    .then(dockerData => {
                        if (dockerData.success && dockerData.dojo && dockerData.module && dockerData.challenge) {
                            const currentChallengeNum = parseInt(dockerData.challenge);
                            const nextChallengeNum = currentChallengeNum + 1;
                            const practice = dockerData.practice || false;

                            // Start the next challenge
                            const startParams = {
                                "dojo": dockerData.dojo,
                                "module": dockerData.module,
                                "challenge": nextChallengeNum,
                                "practice": practice
                            };

                            animateBanner(event, "Starting next challenge...", "info");

                            fetch('/pwncollege_api/v1/docker', {
                                method: 'POST',
                                credentials: 'same-origin',
                                headers: {
                                    'Accept': 'application/json',
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify(startParams)
                            })
                            .then(response => response.json())
                            .then(result => {
                                if (result.success !== false) {
                                    // Success - navigate to workspace
                                    window.location.href = '/workspace';
                                } else {
                                    // Show error or navigate to module if next challenge doesn't exist
                                    const moduleUrl = `/dojos/${dockerData.dojo}/${dockerData.module}#challenge-${nextChallengeNum}`;
                                    window.location.href = moduleUrl;
                                }
                            })
                            .catch(error => {
                                console.error('Error starting next challenge:', error);
                                animateBanner(event, "Error starting next challenge", "warn");
                            });
                        } else {
                            animateBanner(event, "Cannot determine current challenge", "warn");
                        }
                    })
                    .catch(error => {
                        console.error('Error fetching docker info:', error);
                        animateBanner(event, "Error getting challenge info", "warn");
                    });
            } else {
                animateBanner(event, "No active challenge", "warn");
            }
        });
    });
});