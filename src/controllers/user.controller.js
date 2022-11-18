const User = require('../schema/user.schema');

module.exports.getUsersWithPostCount = async (req, res) => {
    try {
        //TODO: Implement this API
        let { page, limit } = req.query;
        const count = await User.countDocuments()
        page = Number(page) || 0;
        limit = Number(limit) || count;
        const offset = page ? (page - 1) * limit : 0;

        let data = await User.aggregate([
            {
                $lookup: {
                    from: 'posts',
                    let: { user_id: "$_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $eq: ["$userId", "$$user_id"]
                                }
                            }
                        }], as: "posts"
                }
            },
            {
                $project: {
                    _id: "$_id",
                    name: 1,
                    posts: {
                        $size: "$posts"
                    }
                }
            }]).skip(offset).limit(limit);

        let resData;
        if (page && limit) {
            resData = {
                data: {
                    users: data,
                    pagination: {
                        totalDocs: count,
                        limit: limit,
                        page: page,
                        totalPages: Math.floor(count / limit),
                        pagingCounter: page,
                        hasPrevPage: page === 1 ? false : true,
                        hasNextPage: page === Math.floor(count / limit) ? false : true,
                        prevPage: page === 1 ? null : page - 1,
                        nextPage: page === Math.floor(count / limit) ? null : page + 1
                    }
                }
            }
        } else {
            resData = {
                data: {
                    users: data
                }
            }
        }

        res.status(200).json(resData)
    } catch (error) {
        res.send({ error: error.message });
    }
}