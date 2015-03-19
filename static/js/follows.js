	$(function () {
		setContainerSize();
		$(window).resize(function() {
			setContainerSize();
		});
		
		$(window).scroll(function() {
			var isCategorySelected = followArgs.isFollowers ? $('#followersNavItem').hasClass('active') : $('#followingNavItem').hasClass('active');
			if ( isCategorySelected
			    && ! $('#follows_scroll_loading').is(':visible') 
				&& ! $('#noMoreFound').is(':visible') 
				&& ($('#follows .followItem').length > 0)
				&& ($(window).scrollTop() + $(window).height() > $(document).height() - 400)) {
       	 		
				$('#follows_scroll_loading').show();
				appendFollowInfos();
    		}
		});
	});
	
	var followArgs = {
		userId : 0,
		viewingUserId : 0,
		isLoggedIn : false,
		limit : 0,
		beforeDate : '',
		isFollowers : false
	};
	
	var latestUserFollowId = 0
		
	function loadFollows(userId, viewingUserId, beforeDate, limit, isFollowers, isLoggedIn, maxId) {
		setContainerSize();
		$(window).resize(function() {
			setContainerSize();
		});		

		$('#followsLoading').show();
		latestUserFollowId = maxId;
		
		followArgs.userId = userId;
		followArgs.viewingUserId = viewingUserId;
		followArgs.beforeDate = beforeDate;
		followArgs.limit = limit;
		followArgs.isFollowers = isFollowers;
		followArgs.isLoggedIn = isLoggedIn;
		
		loadFollowInfos();
	}
		
	function positionFollowInfos() {
		$('#follows').masonry({ 
			itemSelector: '.followItem' 
		});
	}
		
	function displayFollows() {
		$('#followsLoading').hide();
		$('#follows_scroll_loading').hide();
		
		var isCategorySelected = followArgs.isFollowers ? $('#followersNavItem').hasClass('active') : $('#followingNavItem').hasClass('active');
		
		if (isCategorySelected) {
			$('#follows').show();
		}
		
		positionFollowInfos();
	}
		
	function placeFollowInfos(items) {
		$('#follows').remove();
		$('#wrapper').append('<div id="follows" style="display: none;" class="gridContainer"></div>');
		
		var html = '';
		var numFollowItems = 0;
		for (var i in items) {
			//if (items[i].userFollowId < latestUserFollowId) {
		 		html += writeFollowInfoHTML(items[i]);
				numFollowItems++;
				latestUserFollowId = items[i].userFollowId;
			//}
   		}
		
        $('#follows').append(html);
		
		if (numFollowItems > 0) {
			followArgs.beforeDate = items[numFollowItems - 1].createDate;
		}
		
		bindFollowActions();
		displayFollows();
			
		if ($('#follows .followItem').length <= 0) {
			$('#followsLoading').hide();
			
			if (followArgs.isFollowers) {
				$('#noFollowersFound').show();
			} else {
				$('#noFollowingFound').show();
			}
		}
	}
	
	function imageLoad(img) {
		$(img).hide();
		$(img).css('opacity', 1);
		$(img).fadeIn(1000);
	}
		
	function writeFollowInfoHTML(followInfo) {
		var html = '<div class="followItem">'
				 + '<input type="hidden" class="userId" value="' + followInfo.userId + '" />'
				 + '<a style="color: #333; text-decoration: none;" href="/' + followInfo.username + '">'
				 + '<div class="followItemTitle">'
				 + '<span style="font-weight: bold; font-size: 16px;">' + followInfo.firstname + ' ' + followInfo.lastname + '</span>'
				 + '<br/><span style="margin-left: 5px; opacity: 0.8; font-size: 16px;">@' + followInfo.username + '</span>'
				 + '</div>'
				 + '</a>'
				 + '<a href="/' + followInfo.username + '">'
				 + '<img class="followItemImage" onload="imageLoad(this); style="opacity: 0;" src="' + followInfo.profileImageUrl + '"/>'
				 + '</a>'
				 + '<br/>';
				 
		if (followArgs.viewingUserId === followInfo.userId) {
			html += '<h2 style="margin-top: 8px;"><span class="label label-info">you!</span></h2>';
		} else {
			html += '<div class="followButton"' + (followInfo.isFollowing ? 'style="display: none;"' : '') + '><button type="button" class="btn btn-default" style="font-weight: bold;">Follow</button></div>'
		 		 + '<div class="unfollowButton"' + ( ! followInfo.isFollowing ? 'style="display: none;"' : '') + '><button type="button" class="btn btn-primary" style="font-weight: bold; width: 94px;">Following</button>'				 
				 + '</div>';
		}
		
		html += '</div>'
		
		return html;
	}
		
	function loadFollowInfos() {
		$.ajax({
    		url: followArgs.isFollowers ? '/ajax/follow/getFollowers.php' : '/ajax/follow/getFollowing.php',
    		type: 'POST',
    		data: followArgs,
    		dataType:'json',
    		success: function(items) {
				placeFollowInfos(items);		
			},
			error: function(a, b, c) {
				displayFollows();
			}
		});
	}
	
	function appendFollowInfos() {
		$.ajax({
    		url: followArgs.isFollowers ? '/ajax/follow/getFollowers.php' : '/ajax/follow/getFollowing.php',
    		type: 'POST',
    		data: followArgs,
    		dataType:'json',
    		success: function(items) {
				if (items.length <= 0 && ($('#follows .followItem').length > 0)) {
					displayFollows();
					$('#noMoreFound').show();
				} else {
					followArgs.beforeDate = items.length > 0 
											? items[items.length - 1].createDate 
											: followArgs.beforeDate;
					
					var html = '';
					for (var i in items) {
						if (items[i].userFollowId < latestUserFollowId) {
							html += writeFollowInfoHTML(items[i]);
							latestUserFollowId = items[i].userFollowId;
						}
					}
					
					if (html !== '') {
	        			var $moreFollows = jQuery(html);
	        			
						$('#follows').append($moreFollows);
						bindFollowActions();
						displayFollows();
	        			$('#follows').masonry('appended', $moreFollows); 
					}
				}
			},
			error: function(a, b, c) {
				displayFollows();
			}
		});
	}
	
	function bindFollowActions() {		
			$('.unfollowButton').children().mouseout(function () {
				$(this).html('Following');
				$(this).removeClass('btn btn-danger');
				$(this).addClass('btn btn-primary');					
			});
			
			$('.unfollowButton').children().mouseover(function () {
				$(this).html('Unfollow');
				$(this).removeClass('btn btn-primary');
				$(this).addClass('btn btn-danger');			
			});


			$('.followButton').children().click(function () {
				var followDiv = $(this).parent().parent();
				
				if (followArgs.isLoggedIn) {
					$.ajax({
	    				url: '/ajax/user/followUser.php',
	    				type: 'POST',
	    				data: { 
							userId: followDiv.find('.userId').first().val(),
							followingUserId: followArgs.viewingUserId
						},
	    				dataType:'json'
					});
					
					followDiv.find('.followButton').hide();
					followDiv.find('.unfollowButton').show();
				} else {
					window.location.href = '/login?cont=' + window.location.pathname;
				}		
			});	
			
			$('.unfollowButton').children().click(function () {
				var followDiv = $(this).parent().parent();
				
				if (followArgs.isLoggedIn) {
					$.ajax({
	    				url: '/ajax/user/unfollowUser.php',
	    				type: 'POST',
	    				data: { 
							userId: followDiv.find('.userId').first().val(),
							followingUserId: followArgs.viewingUserId
						},
	    				dataType:'json'
					});
					
					followDiv.find('.unfollowButton').hide();
					followDiv.find('.followButton').show();	
				} else {
					window.location.href = '/login?cont=' + window.location.pathname;
				}						
			});
	}