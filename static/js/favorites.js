	$(function () {
		setCollectionContainerSize();
		$(window).resize(function() {
			setCollectionContainerSize();
		});
		
		$(window).scroll(function() {
			if ($('#favoritesNavItem').hasClass('active')
			    && ! $('#scroll_loading').is(':visible') 
				&& ! $('#noMoreFound').is(':visible')
				&& ! $('#noFavoritesFound').is(':visible')
				&& ! $('#favoritesLoading').is(':visible')
				&& ($(window).scrollTop() + $(window).height() > $(document).height() - 400)) {
       	 		
				$('#scroll_loading').show();
				appendFavorites();
    		}
		});
	});	

	var favoriteArgs = {
		canEdit : false,
		userId : 0,
		limit : 0,
		beforeId : 0
	};
	
	function positionFavoriteItems() {
		$('#favorites').masonry({ 
			itemSelector: '.collectionItem' 
		});
	}
		
	function displayFavorites() {
		$('#favoritesLoading').hide();
		$('#scroll_loading').hide();
			
		if ($('#favoritesNavItem').hasClass('active')) {
			$('#favorites').show();
		}
	}
		
	function bindFavoriteActions() {
		$('.collectionItemDisplay').hover(function() {
			$(this).find('.colectionItemActions').show();
			$(this).css('opacity', 0.9);
		});
			
		$('.collectionItemDisplay').mouseleave(function() {
			$(this).find('.colectionItemActions').hide();
			$(this).css('opacity', 1);
		});
				
		$('.collectionItemDisplay').each(function() {
			var itemDisplay = $(this);
				
			itemDisplay.find('.editCollection').first().hover(function () {
				itemDisplay.css('opacity', 1);
			});	
					
			itemDisplay.find('.editCollection').first().mouseleave(function () {
				itemDisplay.css('opacity', 0.9);
			});	
		});
		
		$('.unfavoriteCollectionWrapper').find('a').hover(function () {
			$(this).removeClass('btn btn-primary');
			$(this).addClass('btn btn-danger');
			$(this).html('<span class="glyphicon glyphicon-remove-circle"></span> Unfavorite');
		});
			
		$('.unfavoriteCollectionWrapper').find('a').mouseout(function () {
			$(this).removeClass('btn btn-danger');
			$(this).addClass('btn btn-primary');
			$(this).html('<span class="glyphicon glyphicon-ok"></span> Favorited');
		});
				
		displayFavorites();
		positionFavoriteItems();
	}
	
	function favoriteCollection(btn) {
		var container = $(btn).parent().parent();
		$.ajax({
	    	url: '/ajax/collection/favorite.php',
	    	type: 'POST',
	    	data: {					
				collectionId : parseInt(container.find('.collectionId').val()),
				userId : favoriteArgs.userId
			},
	    	dataType:'json'
		});
		
		container.find('.favoriteCollectionWrapper').hide();
		container.find('.unfavoriteCollectionWrapper').show();
	}
	
	function unfavoriteCollection(btn) {
		var container = $(btn).parent().parent();
		$.ajax({
	    	url: '/ajax/collection/unfavorite.php',
	    	type: 'POST',
	    	data: {					
				collectionId : parseInt(container.find('.collectionId').val()),
				userId : favoriteArgs.userId
			},
	    	dataType:'json'
		});

		container.find('.unfavoriteCollectionWrapper').hide();
		container.find('.favoriteCollectionWrapper').show();	
	}
		
	    function writeFavoriteItemHTML(collection) {
			var html = '<div class="collectionItem">'
					 + '<div class="collectionitemDisplay">'
					 + '<a style="text-decoration: none;" class="collectionLink" href="/' + collection.collectionOwnerUsername + '/' + collection.collectionName.replace(/\ /g, '-') + '">'
					 + '<div>'
					 + '<div style="background-image: url(\'' + collection.coverImageUrl + '\');" class="collection" />'
					 + '<div class="collectionName">' + (collection.collectionName.length > 80 ? (collection.collectionName.substring(0, 78) + '...') : collection.collectionName)
					 + '</div></div>'
					 + '</a>';
					 				 	
					 if (favoriteArgs.canEdit) {
					 	html += '<div class="favoriteCollection">'
							 + '<input type="hidden" class="collectionId" value="' + collection.collectionId + '" />'
							 + '<div class="favoriteCollectionWrapper" style="display: none;"><a class="btn btn-primary" style="float: left;" onclick="favoriteCollection(this);">'
							 + '<span class="glyphicon glyphicon-star"></span> Favorite'
							 + '</a></div>'
							 + '<div class="unfavoriteCollectionWrapper"><a class="btn btn-primary" style="float: left;" onclick="unfavoriteCollection(this);">'
							 + '<span class="glyphicon glyphicon-ok"></span> Favorited'
							 + '</a></div>'
					         + '</div>';					 	
					 }
			
			html += '</div></div>';
			return html;
		}
		
	function loadFavoriteCollections(userId, limit, beforeId, canEdit) {
		setCollectionContainerSize();
		$(window).resize(function() {
			setCollectionContainerSize();
		});
		
		$('#favorites').remove();
		$('#wrapper').append('<div id="favorites" style="display: none;" class="gridContainer"></div>');
		
		$('#favoritesLoading').show();
		favoriteArgs.canEdit = canEdit;
		favoriteArgs.limit = limit;
		favoriteArgs.userId = userId;
		favoriteArgs.beforeId = beforeId;
		loadAllFavoriteCollections();
	}
		
	function loadAllFavoriteCollections() {
		$.ajax({
	    	url: favoriteArgs.canEdit 
				? '/ajax/collection/getFavoriteItems.php' 
				: '/ajax/collection/getPublicFavoriteItems.php',
	    	type: 'POST',
	    	data: {					
				userId : favoriteArgs.userId,
				beforeId : favoriteArgs.beforeId,
				limit : favoriteArgs.limit
			},
	    	dataType:'json',
	    	success: function(favorites) {
				placeFavoriteItems(favorites);	
			},
			error: function (a, b, c) {
					
			}
		});
	}
		
	function placeFavoriteItems(items) {
		var html = '';
			
		for (var i in items) {
		  	html += writeFavoriteItemHTML(items[i]);
   		}
		
		favoriteArgs.beforeId = items.length > 0 
						  ? items[items.length - 1].favoriteId 
						  : favoriteArgs.beforeId;
		
			
		if ($('#favorites').children().length > 0) {
			if (items.length <= 0) {
				$('#noMoreFound').show();
			} else {
        		var $moreFiles = jQuery(html);
        		$('#favorites').append($moreFiles);
        		$('#favorites').masonry('appended', $moreFiles);  
			}	
		} else {
			$('#favorites').append(html);
				
			if (items.length <= 0) {
				$('#noFavoritesFound').show();
			}				
		}
			
		bindFavoriteActions();
	}
		
	function appendFavorites() {
		loadAllFavoriteCollections();
	}