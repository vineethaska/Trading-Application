const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const storySchema = new Schema({
        ProductName: {type: String,  required: [true, 'Product Name is required']},
        ProductCategory: {type: String,  required: [true, 'Product Category is required']},
        Image: {type: String,  required: [false, 'Product Name is required']},
        ProductDetails: {type: String,  required: [true, 'Product Details is required'],minlength:[10, 'Content must have atleast 10 characters']},
        SellerDetails: {type: String,  required: [true, 'Seller Details is required']},
        author: {type:Schema.Types.ObjectId, ref: 'user'},
        status: { type: String, required: [false, 'Status is set internally'] },
        tradeWith: {type: Schema.Types.ObjectId, ref: 'stories'}
},
{ timestamps: true });
    
storySchema.pre('deleteOne', (next) => {
        let id = this.getQuery()['_id'];
        watchList.deleteMany({ trade: id }).exec();
        next();
      });
      
const stories = mongoose.model('stories', storySchema);

module.exports = stories;