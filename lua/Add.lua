Handlers.add(
    "Add",
    Handlers.utils.hasMatchingTag("Action", "Add"),
    function(msg)
        local found = false
        for _, undernameTarget in ipairs(Undernames) do
            if undernameTarget.undername == msg.Tags.Undername then
                found = true
                break
            end
        end

        -- 不存在则加入
        if not found then
            table.insert(Undernames, { undername = msg.Tags.Undername, target = msg.Tags.Target })
            Handlers.utils.reply("success")(msg)
        else
            Handlers.utils.reply("fail")(msg)
        end
    end
)
