//const express = require('express');
const mongoose = require('mongoose');
const shortid = require('shortid');
const response = require('./../libs/responseLib');
const time = require('./../libs/responseLib');
const check = require('./../libs/checkLib');
const logger = require('./../libs/loggerLib');
//require('./../models/Blog');

//Importing Model here
const BlogModel = mongoose.model('Blog');

let getAllBlog = (req, res) => {

    BlogModel.find()
        .select('-__v -_id') // deselecting the __v and _id part which is part of Mongo DB as we don't to see the user _id part
        .lean() // Returns plain JS objects not MongooseDocuments
        .exec((err, result) => {

            if (err) {
                //console.log(err);
                logger.error(err.message, 'BlogController: getAllBlog', 10/*Highest level(db error)*/)
                let apiResponse = response.generate(true, 'Failed to Find Blog Details', 500, null);
                res.send(apiResponse);

            } else if(check.isEmpty(result)) {
                logger.info('No Blog Found', 'BlogController: getAllBlog')
                let apiResponse = response.generate(true, 'No Blog Found', 404, null);
                //console.log('No Blog Found');
                res.send(apiResponse);

            } else {
                let apiResponse = response.generate(false, 'All Blog Details Found', 200, result);
                res.send(apiResponse)
            }
        })
}// end get all blogs

/*
* Function to read single blog
 */
let viewByBlogId = (req, res) => {

    //console.log(req.user)
    if (check.isEmpty(req.params.blogId)) {

        console.log('blogId should be passed')
        let apiResponse = response.generate(true, 'blogId is missing', 403, null)
        res.send(apiResponse)

    } else {

        console.log(typeof(req.params.blogId));
        BlogModel.findOne({ 'blogId': req.params.blogId }/*Condition*/, (err, result) => {

            if (err) {
                //console.log(err);
                logger.error(`Error Occured : ${err}`, 'Database', 10)
                let apiResponse = response.generate(true, "Error occured.", 500, null)
                res.send(apiResponse);

            } else if (check.isEmpty(result)) {
                logger.info(`Error Occured : ${err}`, 'No Blog Found by that Blog ID', 5)
                let apiResponse = response.generate(true, "No Blog Found by that Blog ID", 404, null)
                //console.log('No Blog Found by that Blog ID');
                res.send(apiResponse);

            } else {
                logger.info("Blog found successfully", "BlogController:ViewBlogById", 5)
                let apiResponse = response.generate(false, "Blog Found Successfully", 200, result)
                res.send(apiResponse);
            }
        })
    }
}

/*
* Function to read single blog by author
 */
let viewByAuthor = (req, res) => {

    if (check.isEmpty(req.params.author)) {

        console.log('author should be passed')
        let apiResponse = response.generate(true, 'author is missing', 403, null)
        res.send(apiResponse)
    } else {

        BlogModel.findOne({ 'author': req.params.author }, (err, result) => {

            if (err) {
                //console.log(err);
                logger.error(`Error Occured : ${err}`, 'Database', 10)
                let apiResponse = response.generate(true, "Error occured.", 500, null)
                res.send(apiResponse);

            } else if (check.isEmpty(result)) {
                let apiResponse = response.generate(true, "No Blog Found by that Author", 404, null)
                //console.log('No Blog Found by that Author');
                res.send(apiResponse);

            } else {
                let apiResponse = response.generate(false, "Blog Found Successfully", 200, result);
                res.send(apiResponse);
            }
        })
    }
}

/*
* Function to read single blog by category 
 */
let viewByCategory = (req, res) => {

    if (check.isEmpty(req.params.categoryId)) {

        console.log('categoryId should be passed')
        let apiResponse = response.generate(true, 'CategoryId is missing', 403, null)
        res.send(apiResponse)
    } else {

        BlogModel.findOne({ 'category': req.params.category }, (err, result) => {

            if (err) {
                //console.log(err);
                logger.error(`Error Occured : ${err}`, 'Database', 10)
                let apiResponse = response.generate(true, "Error occured.", 500, null)
                res.send(apiResponse);

            } else if (check.isEmpty(result)) {
                let apiResponse = response.generate(true, "No Blog found by that Category", 404, null)
                //console.log('No Blog found by that Category');
                res.send(apiResponse);

            } else {
                let apiResponse = response.generate(true, "Blog Found Successfully", 200, result)
                res.send(apiResponse);
            }

        })
    }
}

/*
* Function to create the blog
 */
let createBlog = (req, res) => {
    var today = Date.now();
    let blogId = shortid.generate();

    let newBlog = new BlogModel({

        blogId: blogId,
        title: req.body.title,
        description: req.body.description,
        bodyHtml: req.body.blogBody,
        isPublished: true,
        category: req.body.category,
        author: req.body.fullName,
        created: time.now,
        lastModified: today
    })// end new blog model

    // for making tags array as 'Array of Strings'
    let tags = (req.body.tags != undefined && req.body.tags != null && req.body.tags != '') ? req.body.tags.split(',') : []
    newBlog.tags = tags;

    //Mongoose func save()
    newBlog.save((err, result) => {

        if (err) {
            console.log(err)
            let apiResponse = response.generate(true, "Not Blog Created Successfully", 404, null)
            res.send(err)

        } else {
            let apiResponse = response.generate(false, "Blog Created Successfully", 200, result)
            res.send(apiResponse)
        }
    }) // end newBlog save 
}

/*
* Function to edit single blog by admin
 */
let editBlog = (req, res) => {

    //load the whole body
    let options = req.body;
    console.log(options);

    BlogModel.updateOne({ 'blogId': req.params.blogId }, options, { multi: true }/*Multiple records if it is there*/)
        .exec((err, result) => {

            if (err) {
                console.log(err);
                let apiResponse = response.generate(true, "Error Occured.", 500, null)
                res.send(apiResponse);

            } else if (check.isEmpty(result)) {
                let apiResponse = response.generate(true, "No Blog Found by that blogId", 404, null)
                //console.log('No BLog found by that ID');
                res.send(apiResponse);

            } else {
                let apiResponse = response.generate(false, "Blog Edited Successfully", 200, result)
                res.send(apiResponse);

            }
        })
}

/*
* Function to increase views of a blog
 */
let increaseBlogView = (req, res) => {

    BlogModel.findOne({ 'blogId': req.params.blogId }, /*Not applying exec()*/(err, result) => {

        if (err) {
            let apiResponse = response.generate(true, "Error Occured.", 500, null)
            res.send(apiResponse);

        } else if (check.isEmpty(result)) {
            let apiResponse = response.generate(true, "No BLog found by that ID", 404, null)
            //console.log('No BLog found by that ID');
            res.send(apiResponse);

        } else {

            result.views += 1;
            result.save(function (err, result) {

                if (err) {
                    console.log(err);
                    let apiResponse = response.generate(true, "Error Occured while saving blog", 500, null)
                    res.send(apiResponse);

                } else {
                    let apiResponse = response.generate(false, "Blog Updated Successfully", 200, result)
                    //console.log("Blog Updated Successfully");
                    res.send(apiResponse);

                }
            })

        }
    })
}

/*
* Function to delete a blog
 */
let deleteBlog = (req, res) => {

    if (check.isEmpty(req.params.blogId)) {

        console.log('blogId should be passed')
        let apiResponse = response.generate(true, 'blogId is missing', 403, null)
        res.send(apiResponse)
    } else {

        BlogModel.remove({ 'blogId': req.params.blogId }, /*Not applying exec()*/(err, result) => {

            if (err) {
                let apiResponse = response.generate(true, "Error Occured.", 500, null)
                //console.log(err);
                logger.error(`Error Occured : ${err}`, 'Database', 10)
                res.send(apiResponse);

            } else if (check.isEmpty(result)) {
                let apiResponse = response.generate(true, "No BLog found by that ID", 404, null)
                //console.log('No BLog found by that ID');
                res.send(apiResponse);

            } else {
                let apiResponse = response.generate(false, "Blog Deleted Successfully", 200, result)
                res.send(apiResponse);
            }
        })
    }
}

module.exports = {

    getAllBlog: getAllBlog,
    viewByBlogId: viewByBlogId,
    viewByCategory: viewByCategory,
    viewByAuthor: viewByAuthor,
    createBlog: createBlog,
    editBlog: editBlog,
    increaseBlogView: increaseBlogView,
    deleteBlog: deleteBlog
}