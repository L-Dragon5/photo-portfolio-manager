import { Box, Grid, GridItem, Image } from '@chakra-ui/react';
import { Head, Link } from '@inertiajs/react';
import React from 'react';

const BaseLayout = ({ title, children }) => {
  return (
    <>
      <Head title={`${title} | L-Dragon Photography`} />
      <Grid templateRows="0.25fr 1fr" h="100vh" w="full" bgColor="black">
        <GridItem>
          <Link href="/">
            <Box width="60%" margin="0 auto">
              <Image
                src="https://photo-portfolio-production-photoportfolioimages-zo958yhaaa6q.s3.amazonaws.com/logo-white.webp"
                alt="logo"
                width="full"
              />
            </Box>
          </Link>
        </GridItem>
        <GridItem>{children}</GridItem>
      </Grid>
    </>
  );
};

export default BaseLayout;
