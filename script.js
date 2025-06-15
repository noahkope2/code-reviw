// Page (DOM) has finished loading:
$(function () {
  /* 1. API-KEY: START */
  $.ajaxSetup({ headers: { "X-Auth-Token": "a534e63a0d68ad8ec00d" } });
  /* API-KEY: END */

  /* 2. FETCH AND DISPLAY TWEETS */
  function fetchTweets(sort = "recent") {
    $.getJSON(
      "https://www.nafra.at/adad_st2025/project/?sort=" + sort,
      function (data) {
        $("#tweets-container").empty();

        if (data.length === 0) {
          $("#tweets-container").html(`
            <div class="alert alert-info">
              No tweets yet. Be the first to share something from Middle-earth!
            </div>
          `);
          return;
        }

        data.forEach((tweet) => {
          const timeAgo = moment(tweet.created_at).fromNow();
          const tweetElement = `
            <div class="card tweet mb-3" data-tweet-id="${tweet.id}">
              <div class="card-header tweet-header">
                <h5 class="card-title">${tweet.user}</h5>
                <span class="time-ago">${timeAgo}</span>
              </div>
              <div class="card-body tweet-body">
                <p class="card-text">${tweet.text}</p>
              </div>
              <div class="card-footer tweet-footer">
                <div class="tweet-actions">
                  <button class="btn btn-sm like-btn" data-vote-type="upvote">
                    <i class="fas fa-thumbs-up"></i>
                    <span class="like-count">${tweet.likes || 0}</span>
                  </button>
                  <button class="btn btn-sm dislike-btn" data-vote-type="downvote">
                    <i class="fas fa-thumbs-down"></i>
                  </button>
                  <button class="btn btn-sm comment-btn" data-bs-toggle="modal" data-bs-target="#commentModal">
                    <i class="fas fa-comment"></i> Comment
                  </button>
                </div>
                ${
                  tweet.comments && tweet.comments.length > 0
                    ? `
                  <div class="comments-section mt-3">
                    <h6><i class="fas fa-comments"></i> Comments</h6>
                    ${tweet.comments
                      .map(
                        (comment) => `
                      <div class="comment">
                        <strong>${comment.user}</strong>
                        <p>${comment.text}</p>
                        <small class="time-ago">${moment(
                          comment.created_at
                        ).fromNow()}</small>
                      </div>
                    `
                      )
                      .join("")}
                  </div>
                `
                    : ""
                }
              </div>
            </div>
          `;
          $("#tweets-container").append(tweetElement);
        });
      }
    ).fail(function () {
      $("#tweets-container").html(`
        <div class="alert alert-danger">
          Could not load tweets. The road goes ever on and on, but the server seems to be resting.
        </div>
      `);
    });
  }

  // Initial fetch
  fetchTweets();

  // Sort functionality
  $("#sort-select").change(function () {
    fetchTweets($(this).val());
  });

  /* 3. VOTE ON TWEETS */
  $(document).on("click", ".like-btn, .dislike-btn", function (e) {
    e.preventDefault();
    const tweetID = $(this).closest(".tweet").data("tweet-id");
    const voteType = $(this).data("vote-type");
    const likeCountElement = $(this).find(".like-count");

    $.get(
      "https://www.nafra.at/adad_st2025/project/" +
        tweetID +
        "?type=" +
        voteType,
      function (data) {
        likeCountElement.text(data.likes);

        // Visual feedback
        const btn = $(e.target).closest("button");
        btn.addClass("active");
        setTimeout(() => btn.removeClass("active"), 500);
      }
    ).fail(function () {
      alert(
        "Failed to register your vote. The Eye of Sauron might be watching..."
      );
    });
  });

  /* 4. CREATE TWEET */
  $("#create-tweet-form").submit(function (e) {
    e.preventDefault();
    const formData = $(this).serialize();

    if (
      !$("input[name='user']", this).val() ||
      !$("textarea[name='text']", this).val()
    ) {
      alert("Both fields are required to share your tale!");
      return;
    }

    $.post(
      "https://www.nafra.at/adad_st2025/project/",
      formData,
      function (response) {
        $("#create-tweet-form")[0].reset();
        fetchTweets($("#sort-select").val());
      }
    ).fail(function () {
      alert(
        "Your message could not be sent. The Palantír is not responding..."
      );
    });
  });

  /* 5. CREATE COMMENT */
  $(document).on("click", ".comment-btn", function () {
    const tweetID = $(this).closest(".tweet").data("tweet-id");
    $("#comment-tweet-id").val(tweetID);
  });

  $("#comment-form").submit(function (e) {
    e.preventDefault();
    const tweetID = $("#comment-tweet-id").val();
    const formData = $(this).serialize();

    if (
      !$("input[name='user']", this).val() ||
      !$("textarea[name='text']", this).val()
    ) {
      alert("Both fields are required to leave a comment!");
      return;
    }

    $.post(
      "https://www.nafra.at/adad_st2025/project/" + tweetID,
      formData,
      function (response) {
        $("#comment-form")[0].reset();
        $("#commentModal").modal("hide");
        fetchTweets($("#sort-select").val());
      }
    ).fail(function () {
      alert("Your comment could not be posted. The Ents are too slow today...");
    });
  });

  /* 6. ADDITIONAL FEATURES */
  // Auto-refresh every 30 seconds
  setInterval(() => {
    fetchTweets($("#sort-select").val());
  }, 30000);

  // Character selection for tweet author
  $(".character-card .list-group-item").click(function () {
    $("input[name='user']").val($(this).text());
  });
});
// Page (DOM) has finished loading:
$(function () {
  /* 1. API-KEY: START */
  $.ajaxSetup({ headers: { "X-Auth-Token": "a534e63a0d68ad8ec00d" } });
  /* API-KEY: END */

  /* 2. FETCH AND DISPLAY TWEETS */
  function fetchTweets(sort = "recent") {
    $.getJSON(
      "https://www.nafra.at/adad_st2025/project/?sort=" + sort,
      function (data) {
        $("#tweets-container").empty();

        if (data.length === 0) {
          $("#tweets-container").html(`
            <div class="alert alert-info">
              No tweets yet. Be the first to share something from Middle-earth!
            </div>
          `);
          return;
        }

        data.forEach((tweet) => {
          renderTweet(tweet);
        });

        // Start updating time ago for all tweets
        updateAllTimeAgo();
      }
    ).fail(function () {
      $("#tweets-container").html(`
        <div class="alert alert-danger">
          Could not load tweets. The road goes ever on and on, but the server seems to be resting.
        </div>
      `);
    });
  }

  // Render individual tweet
  function renderTweet(tweet) {
    const timeAgo = moment(tweet.created_at).fromNow();
    const tweetElement = `
      <div class="card tweet mb-3" data-tweet-id="${
        tweet.id
      }" data-created-at="${tweet.created_at}">
        <div class="card-header tweet-header">
          <h5 class="card-title">${tweet.user}</h5>
          <span class="time-ago">${timeAgo}</span>
        </div>
        <div class="card-body tweet-body">
          <p class="card-text">${tweet.text}</p>
        </div>
        <div class="card-footer tweet-footer">
          <div class="tweet-actions">
            <button class="btn btn-sm like-btn ${
              tweet.user_liked ? "active" : ""
            }" data-vote-type="upvote">
              <i class="fas fa-thumbs-up"></i>
              <span class="like-count">${tweet.likes || 0}</span>
            </button>
            <button class="btn btn-sm dislike-btn ${
              tweet.user_disliked ? "active" : ""
            }" data-vote-type="downvote">
              <i class="fas fa-thumbs-down"></i>
            </button>
            <button class="btn btn-sm comment-btn" data-bs-toggle="modal" data-bs-target="#commentModal">
              <i class="fas fa-comment"></i> Comment
            </button>
          </div>
          ${
            tweet.comments && tweet.comments.length > 0
              ? `
            <div class="comments-section mt-3">
              <h6><i class="fas fa-comments"></i> Comments</h6>
              ${tweet.comments
                .map(
                  (comment) => `
                <div class="comment" data-created-at="${comment.created_at}">
                  <strong>${comment.user}</strong>
                  <p>${comment.text}</p>
                  <small class="time-ago">${moment(
                    comment.created_at
                  ).fromNow()}</small>
                </div>
              `
                )
                .join("")}
            </div>
          `
              : ""
          }
        </div>
      </div>
    `;
    $("#tweets-container").append(tweetElement);
  }

  // Update all time-ago elements
  function updateAllTimeAgo() {
    $(".tweet, .comment").each(function () {
      const createdAt = $(this).data("created-at");
      if (createdAt) {
        const timeAgo = moment(createdAt).fromNow();
        $(this).find(".time-ago").text(timeAgo);
      }
    });
  }

  // Initial fetch
  fetchTweets();

  // Update time every minute
  setInterval(updateAllTimeAgo, 60000);

  // Sort functionality
  $("#sort-select").change(function () {
    fetchTweets($(this).val());
  });

  /* 3. VOTE ON TWEETS - IMPROVED */
  $(document).on("click", ".like-btn, .dislike-btn", function (e) {
    e.preventDefault();
    const tweetElement = $(this).closest(".tweet");
    const tweetID = tweetElement.data("tweet-id");
    const voteType = $(this).data("vote-type");
    const likeCountElement = $(this).find(".like-count");

    // Visual feedback immediately
    $(this).addClass("active");
    if (voteType === "upvote") {
      tweetElement.find(".dislike-btn").removeClass("active");
      const currentLikes = parseInt(likeCountElement.text()) || 0;
      likeCountElement.text(currentLikes + 1);
    } else {
      tweetElement.find(".like-btn").removeClass("active");
    }

    // Send request to server
    $.get(
      "https://www.nafra.at/adad_st2025/project/" +
        tweetID +
        "?type=" +
        voteType,
      function (data) {
        // Update with actual server response
        likeCountElement.text(data.likes);

        // Update active state based on server response
        if (data.user_liked) {
          tweetElement.find(".like-btn").addClass("active");
          tweetElement.find(".dislike-btn").removeClass("active");
        } else if (data.user_disliked) {
          tweetElement.find(".dislike-btn").addClass("active");
          tweetElement.find(".like-btn").removeClass("active");
        } else {
          tweetElement.find(".like-btn, .dislike-btn").removeClass("active");
        }
      }
    ).fail(function () {
      // Revert visual changes if request fails
      const currentLikes = parseInt(likeCountElement.text()) || 0;
      if (voteType === "upvote") {
        likeCountElement.text(Math.max(0, currentLikes - 1));
      }
      $(this).removeClass("active");
      alert(
        "Failed to register your vote. The Eye of Sauron might be watching..."
      );
    });
  });

  /* Rest of the code remains the same as before */
  // ... [keep all other functions from the previous version]
});
