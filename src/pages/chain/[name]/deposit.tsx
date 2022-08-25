import { GetStaticPropsContext, NextPage } from "next";
import Head from "next/head";
import React from "react";
import * as dfd from "danfojs";

import { queryFlipside } from "../../../utils/FlipsideQuery";
import { BridgeOut } from "../../../layouts/BridgeOut";
import { depositQuery } from "../../../sql/deposit";
import { fetchDeployments } from "../../../utils/DeplymentFetch";
import { prefetchPages } from "../../../json/prefetch";
import { useRouter } from "next/router";

export async function getStaticPaths() {
  return {
    paths: prefetchPages,
    fallback: false, // can also be true or 'blocking'
  };
}

export async function getStaticProps(context: GetStaticPropsContext) {
  const chain = (context.params!.name as string).toUpperCase();

  let deployments = fetchDeployments(chain)
  console.log(deployments)
  let { network, liq_prov, liq_pool, weth, usdc, usdt, bico } = deployments;

  const data = await queryFlipside(
    depositQuery({ network, liq_pool, weth, usdc, usdt, bico })
  );

  data?.map((datapoint) => {
    datapoint.date = new Date(datapoint.date as string).getTime();
  });

  return {
    props: { data }, // will be passed to the page component as props
    revalidate: 1000,
  };
}

interface Props {
  data: JSON[];
}

const Deposit: NextPage<Props> = ({ data }: Props) => {
  let df = new dfd.DataFrame(data);
  // console.log(df)

  const router = useRouter()
  const { name } = router.query

  return (
    <div>
      <Head>
        <title> Bridging from {(name! as string).toUpperCase()} </title>
      </Head>
      <BridgeOut data={df} />
    </div>
  );
};

export default Deposit;
