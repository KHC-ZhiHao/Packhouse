this.packhose
    .express(`
        |> :v, :b
        |> :v, aws@s3/save
        |> aws@dynamodb/put
    `)
    .always()
    .noGood()
    .action()
