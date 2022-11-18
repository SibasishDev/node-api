const User = require('../schema/user.schema');

module.exports.getUsersWithPostCount = async (req, res) => {
    try {
        //TODO: Implement this API
        let { page, limit } = req.query;
        page = Number(page);
        limit = Number(limit);
        const offset = (page - 1) * limit;

        const data = await User.aggregate([
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
            }]);

        let resData;
        if (page && limit) {
            resData = {
                data: {
                    users: data.slice(offset, offset + limit),
                    pagination: {
                        totalDocs: data.length,
                        limit: limit,
                        page: page,
                        totalPages: Math.floor(data.length / limit),
                        pagingCounter: page,
                        hasPrevPage: page === 1 ? false : true,
                        hasNextPage: page === Math.floor(data.length / limit) ? false : true,
                        prevPage: page === 1 ? null : page - 1,
                        nextPage: page === Math.floor(data.length / limit) ? null : page + 1
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

