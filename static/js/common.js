	function formatTimestamp(timestamp) {
		var dateString = '';

		var currentTimestamp = (new Date().getTime()/1000);
		var secondsFromNow = Math.floor(currentTimestamp - timestamp);
		var minsFromNow = Math.floor(secondsFromNow/60);
		var hoursFromNow = Math.floor(minsFromNow/60);
		var daysFromNow = Math.floor(hoursFromNow/24);
		var weeksFromNow = Math.floor(daysFromNow/7);
		var monthsFromNow = Math.floor(weeksFromNow/4);
		var yearsFromNow = Math.floor(monthsFromNow/12);
		
		if (secondsFromNow < 1) {
			dateString = 'Just now';
		} else if (secondsFromNow < 60) {
			dateString = (secondsFromNow === 1) ? ('1 second ago') : (secondsFromNow + ' seconds ago');
		} else if (minsFromNow < 60) {
			dateString = (minsFromNow === 1) ? ('1 minute ago') : (minsFromNow + ' minutes ago');
		} else if (hoursFromNow < 24) {
			dateString = (hoursFromNow === 1) ? ('1 hour ago') : (hoursFromNow + ' hours ago');
		} else if (daysFromNow < 7) {
			dateString = (daysFromNow === 1) ? ('yesterday') : (daysFromNow + ' days ago');
		} else if (weeksFromNow < 4) {
			dateString = (weeksFromNow === 1) ? ('1 week ago') : (weeksFromNow + ' weeks ago');
		} else if (monthsFromNow < 12) {
			dateString = (monthsFromNow === 1) ? ('1 month ago') : (monthsFromNow + ' months ago');
		} else {
			dateString = (yearsFromNow === 1) ? ('about a year ago') : (yearsFromNow + ' years ago');
		} 
			
		return dateString;
	}
	
	function formatTimestampSimple(timestamp) {
		var dateString = '';

		var currentTimestamp = (new Date().getTime()/1000);
		var secondsFromNow = Math.floor(currentTimestamp - timestamp);
		var minsFromNow = Math.floor(secondsFromNow/60);
		var hoursFromNow = Math.floor(minsFromNow/60);
		var daysFromNow = Math.floor(hoursFromNow/24);
		var weeksFromNow = Math.floor(daysFromNow/7);
		var monthsFromNow = Math.floor(weeksFromNow/4);
		var yearsFromNow = Math.floor(monthsFromNow/12);
		
		if (secondsFromNow < 1) {
			dateString = 'Just now';
		} else if (secondsFromNow < 60) {
			dateString = secondsFromNow + 's';
		} else if (minsFromNow < 60) {
			dateString = minsFromNow + 'm';
		} else if (hoursFromNow < 24) {
			dateString = hoursFromNow + 'h';
		} else if (daysFromNow < 7) {
			dateString = daysFromNow + 'd';
		} else {
			dateString = weeksFromNow + 'w';
		}
			
		return dateString;
	}
	
	var childWindow = false;
	
	function openWindow(url) {
		if (childWindow) {
			childWindow.close();
			childWindow = window.open(url, 'child', 'width=550,height=360,0,status=0,');
		} else {
			childWindow = window.open(url, 'child', 'width=550,height=360,0,status=0,');
		}
	}
	
	function setContainerSize() {
		if ($(window).width() >= 1230) { // 5 columns
			$("#wrapper").width(1230);
		} else if ($(window).width() >= 984) { // 4 columns
			$("#wrapper").width(984);
		} else if ($(window).width() >= 738) { // 3 columns
			$("#wrapper").width(738);
		} else if ($(window).width() >= 492) { // 2 columns
			$("#wrapper").width(492);
		} else if ($(window).width() >= 246) { // 1 column
			$("#wrapper").width(246);
		} else {
			$("#wrapper").width(246);
		}
	}
	
	function setCollectionContainerSize() {
		if ($(window).width() >= 1140) { // 4 collections
			$("#wrapper").width(1140);
		} else if ($(window).width() >= 855) { // 3 collections
			$("#wrapper").width(855);
		} else if ($(window).width() >= 570) { // 2 collections
			$("#wrapper").width(570);
		} else if ($(window).width() >= 285) { // 1 collection
			$("#wrapper").width(285);
		} else {
			$("#wrapper").width(285);
		}			
	}
	
	function exists(obj) {
		return obj !== null && typeof obj !== 'undefined' && obj !== '';
	}
	
	function getUrlSafeCollectionName(name) {
		return name.replace(/\ /g, '-').replace(';', '%3B').replace('#', '%23').replace('/', '%2F');
	}
	
	function viewFullSize(label) {
		var item = $(label).parent().parent().parent().first();
		item.children().find('.viewFile').click();
		return false;
	}