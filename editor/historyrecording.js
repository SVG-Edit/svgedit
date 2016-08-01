/*globals svgedit*/
/*jslint vars: true, eqeq: true */
/**
 * Package: svgedit.history
 *
 * Licensed under the MIT License
 *
 * Copyright(c) 2016 Flint O'Brien
 */

// Dependencies:
// 1) history.js

(function() {
	'use strict';

if (!svgedit.history) {
	svgedit.history = {};
}
var history = svgedit.history;

/**
 * History recording service.
 *
 * A self-contained service interface for recording history. Once injected, no other dependencies
 * or globals are required (example: UndoManager, command types, etc.). Easy to mock for unit tests.
 * Built on top of history classes in history.js.
 *
 * There is a simple start/end interface for batch commands.
 *
 * HistoryRecordingService.NO_HISTORY is a singleton that can be passed in to functions
 * that record history. This helps when the caller requires that no history be recorded.
 *
 * Usage:
 * The following will record history: insert, batch, insert.
 * ```
 * hrService = new svgedit.history.HistoryRecordingService(this.undoMgr);
 * hrService.insertElement(elem, text);         // add simple command to history.
 * hrService.startBatchCommand('create two elements');
 * hrService.changeElement(elem, attrs, text);  // add to batchCommand
 * hrService.changeElement(elem, attrs2, text); // add to batchCommand
 * hrService.endBatchCommand();                  // add batch command with two change commands to history.
 * hrService.insertElement(elem, text);         // add simple command to history.
 * ```
 *
 * Note that all functions return this, so commands can be chained, like so:
 *
 * ```
 * hrService
 *   .startBatchCommand('create two elements')
 *   .insertElement(elem, text)
 *   .changeElement(elem, attrs, text)
 *   .endBatchCommand();
 * ```
 *
 * @param {svgedit.history.UndoManager} undoManager - The undo manager.
 * 		A value of null is valid for cases where no history recording is required.
 * 		See singleton: HistoryRecordingService.NO_HISTORY
 */
var HistoryRecordingService = history.HistoryRecordingService = function(undoManager) {
	this.undoManager_ = undoManager;
	this.currentBatchCommand_ = null;
	this.batchCommandStack_ = [];
};

/**
 * @type {svgedit.history.HistoryRecordingService} NO_HISTORY - Singleton that can be passed
 *		in to functions that record history, but the caller requires that no history be recorded.
 */
HistoryRecordingService.NO_HISTORY = new HistoryRecordingService();

/**
 * Start a batch command so multiple commands can recorded as a single history command.
 * Requires a corresponding call to endBatchCommand. Start and end commands can be nested.
 *
 * @param {string} text - Optional string describing the batch command.
 * @returns {svgedit.history.HistoryRecordingService}
 */
HistoryRecordingService.prototype.startBatchCommand = function(text) {
	if (!this.undoManager_) {return this;}
	this.currentBatchCommand_ = new history.BatchCommand(text);
	this.batchCommandStack_.push(this.currentBatchCommand_);
	return this;
};

/**
 * End a batch command and add it to the history or a parent batch command.
 * @returns {svgedit.history.HistoryRecordingService}
 */
HistoryRecordingService.prototype.endBatchCommand = function() {
	if (!this.undoManager_) {return this;}
	if (this.currentBatchCommand_) {
		var batchCommand = this.currentBatchCommand_;
		this.batchCommandStack_.pop();
		var length = this.batchCommandStack_.length;
		this.currentBatchCommand_ = length ? this.batchCommandStack_[length-1] : null;
		this.addCommand_(batchCommand);
	}
	return this;
};

/**
 * Add a MoveElementCommand to the history or current batch command
 * @param {Element} elem - The DOM element that was moved
 * @param {Element} oldNextSibling - The element's next sibling before it was moved
 * @param {Element} oldParent - The element's parent before it was moved
 * @param {string} [text] - An optional string visible to user related to this change
 * @returns {svgedit.history.HistoryRecordingService}
 */
HistoryRecordingService.prototype.moveElement = function(elem, oldNextSibling, oldParent, text) {
	if (!this.undoManager_) {return this;}
	this.addCommand_(new history.MoveElementCommand(elem, oldNextSibling, oldParent, text));
	return this;
};

/**
 * Add an InsertElementCommand to the history or current batch command
 * @param {Element} elem - The DOM element that was added
 * @param {string} [text] - An optional string visible to user related to this change
 * @returns {svgedit.history.HistoryRecordingService}
 */
HistoryRecordingService.prototype.insertElement = function(elem, text) {
	if (!this.undoManager_) {return this;}
	this.addCommand_(new history.InsertElementCommand(elem, text));
	return this;
};


/**
 * Add a RemoveElementCommand to the history or current batch command
 * @param {Element} elem - The DOM element that was removed
 * @param {Element} oldNextSibling - The element's next sibling before it was removed
 * @param {Element} oldParent - The element's parent before it was removed
 * @param {string} [text] - An optional string visible to user related to this change
 * @returns {svgedit.history.HistoryRecordingService}
 */
HistoryRecordingService.prototype.removeElement = function(elem, oldNextSibling, oldParent, text) {
	if (!this.undoManager_) {return this;}
	this.addCommand_(new history.RemoveElementCommand(elem, oldNextSibling, oldParent, text));
	return this;
};


/**
 * Add a ChangeElementCommand to the history or current batch command
 * @param {Element} elem - The DOM element that was changed
 * @param {object} attrs - An object with the attributes to be changed and the values they had *before* the change
 * @param {string} [text] - An optional string visible to user related to this change
 * @returns {svgedit.history.HistoryRecordingService}
 */
HistoryRecordingService.prototype.changeElement = function(elem, attrs, text) {
	if (!this.undoManager_) {return this;}
	this.addCommand_(new history.ChangeElementCommand(elem, attrs, text));
	return this;
};

/**
 * Private function to add a command to the history or current batch command.
 * @param cmd
 * @returns {svgedit.history.HistoryRecordingService}
 * @private
 */
HistoryRecordingService.prototype.addCommand_ = function(cmd) {
	if (!this.undoManager_) {return this;}
	if (this.currentBatchCommand_) {
		this.currentBatchCommand_.addSubCommand(cmd);
	} else {
		this.undoManager_.addCommandToHistory(cmd);
	}
};


}());
